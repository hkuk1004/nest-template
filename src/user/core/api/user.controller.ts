import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UserService } from '../application/user.service';
import {
  UserExistEmailReqDto,
  UserGetAccessByRefreshReqDto,
  UserGetRefreshByRefreshReqDto,
  UserLoginByEmailPasswordReqDto,
  UserSignUpReqDto,
  UserUpdateMyInfoReqDto,
} from './user.req.dto';
import {
  UserAccessByRefreshResDto,
  UserGetMyInfoResDto,
  UserLoginByEmailPasswordResDto,
  UserRefreshByRefreshResDto,
} from './user.res.dto';
import { AuthUserAuthorizationGuard } from '../../../auth/api/auth.user.authorization.guard';
import { User } from '../../../auth/api/user.decorator';
import { ILoginUserInfo } from '../../../auth/interface/login.user';

@ApiTags('user')
@Controller('')
export class UserController {
  constructor(private userService: UserService) {}

  // ================================================================
  // 이메일 중복 검사 / 회원가입 / 로그인
  // ================================================================

  @ApiOperation({
    summary: '이메일 중복 검사 API',
    description: '이메일를 입력받아 중복인지 확인합니다.',
  })
  @ApiResponse({
    type: Boolean,
    description: 'true => 중복한 이메일이 존재합니다. <br>' + 'false => 중복한 이메일이 존재하지 않습니다.',
  })
  // ============================================
  @Get('/user/exist-email/:email')
  existEmail(@Param() getParam: UserExistEmailReqDto) {
    return this.userService.isExistEmail(getParam.email);
  }

  @ApiOperation({
    summary: '유저 이메일 회원가입 API',
    description:
      'body 정보들을 입력받아 회원가입을 진행합니다.<br>' + '이미 소셜로 가입하였다면 해당 회원가입은 불가능합니다.',
  })
  @ApiCreatedResponse()
  @ApiBadRequestResponse({
    description: '이메일(email)이 이미 가입되어 있는 경우',
  })
  // ============================================
  @Post('/user/sign-up')
  signUp(@Body() getBody: UserSignUpReqDto) {
    return this.userService.signUp(getBody);
  }

  @ApiOperation({
    summary: '유저 email/password 로그인 API',
    description:
      '이메일/비밀번호로 로그인을 진행합니다.<br>' + '소셜로 로그인 했을 경우 에러가 발생합니다.',
  })
  @ApiOkResponse({
    type: UserLoginByEmailPasswordResDto,
    description: '로그인 성공 시 토큰 발급',
  })
  @ApiBadRequestResponse({
    description:
      '이메일(email)이 존재하지 않는 경우<br>' +
      '소셜로 회원가입하여 비밀번호가 존재하지 않는 경우<br>' +
      '비밀번호가 일치하지 않는 경우',
  })
  // ============================================
  @Post('/user/login-email-password')
  loginByEmailPassword(@Body() getBody: UserLoginByEmailPasswordReqDto) {
    return this.userService.loginByEmailPassword(getBody);
  }

  // ================================================================
  // 토큰 재발급
  // ================================================================

  @ApiOperation({
    summary: 'access 토큰 재발급 API',
    description: 'refresh token으로 access 토큰만 재발급합니다.',
  })
  @ApiOkResponse({
    type: UserAccessByRefreshResDto,
    description: 'access 토큰 재발급 성공',
  })
  @ApiBadRequestResponse({ description: 'refresh token을 입력해 주세요.' })
  @ApiUnauthorizedResponse({ description: '토큰이 만료되었거나 유효하지 않은 경우' })
  @ApiForbiddenResponse({ description: '권한이 없습니다.' })
  @ApiInternalServerErrorResponse({ description: '존재하지 않거나 삭제된 유저입니다.' })
  // ============================================
  @Post('/user/access-by-refresh')
  getAccessByRefresh(@Body() getBody: UserGetAccessByRefreshReqDto) {
    return this.userService.getAccessByRefresh(getBody.token);
  }

  @ApiOperation({
    summary: 'refresh 토큰 재발급 API',
    description: 'refresh token으로 access + refresh 둘 다 재발급합니다.',
  })
  @ApiOkResponse({
    type: UserRefreshByRefreshResDto,
    description: 'access 및 refresh 토큰 재발급 성공',
  })
  @ApiBadRequestResponse({ description: 'refresh token을 입력해 주세요.' })
  @ApiUnauthorizedResponse({ description: '토큰이 만료되었거나 유효하지 않은 경우' })
  // ============================================
  @Post('/user/refresh-by-refresh')
  getRefreshByToken(@Body() getBody: UserGetRefreshByRefreshReqDto) {
    return this.userService.getLoginTokenByRefresh(getBody.token);
  }

  // ================================================================
  // 회원정보 CRUD (R/U/D) — 인증 필요
  // ================================================================

  @ApiOperation({
    summary: '내 정보 조회 API',
    description: '로그인한 본인의 회원정보를 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    type: UserGetMyInfoResDto,
    description: '내 정보 조회 성공',
  })
  @ApiUnauthorizedResponse({ description: '인증 토큰이 없거나 유효하지 않습니다.' })
  @ApiNotFoundResponse({ description: '존재하지 않는 유저입니다.' })
  // ============================================
  @UseGuards(AuthUserAuthorizationGuard)
  @Get('/user/me')
  getMyInfo(@User() user: ILoginUserInfo) {
    return this.userService.getMyInfo(user);
  }

  @ApiOperation({
    summary: '내 정보 수정 API',
    description: '로그인한 본인의 회원정보를 수정합니다. 보낸 필드만 변경됩니다.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: '내 정보 수정 성공' })
  @ApiUnauthorizedResponse({ description: '인증 토큰이 없거나 유효하지 않습니다.' })
  @ApiNotFoundResponse({ description: '존재하지 않는 유저입니다.' })
  // ============================================
  @UseGuards(AuthUserAuthorizationGuard)
  @Patch('/user/me')
  updateMyInfo(@User() user: ILoginUserInfo, @Body() getBody: UserUpdateMyInfoReqDto) {
    return this.userService.updateMyInfo(user, getBody);
  }

  @ApiOperation({
    summary: '회원 탈퇴 API',
    description: '로그인한 본인 계정을 Soft Delete 처리합니다.',
  })
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: '회원 탈퇴 성공' })
  @ApiUnauthorizedResponse({ description: '인증 토큰이 없거나 유효하지 않습니다.' })
  @ApiNotFoundResponse({ description: '존재하지 않는 유저입니다.' })
  // ============================================
  @UseGuards(AuthUserAuthorizationGuard)
  @HttpCode(204)
  @Delete('/user/me')
  deleteMe(@User() user: ILoginUserInfo) {
    return this.userService.deleteMe(user);
  }
}

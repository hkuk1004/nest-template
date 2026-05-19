import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PostService } from '../application/post.service';
import {
  PostCreateReqDto,
  PostGetByIdReqParamDto,
  PostGetListReqQueryDto,
  PostUpdateReqDto,
} from './post.req.dto';
import { PostCreateResDto, PostGetDetailResDto, PostGetListResDto } from './post.res.dto';

import { AuthUserAuthorizationGuard } from '../../auth/api/auth.user.authorization.guard';
import { User } from '../../auth/api/user.decorator';
import { ILoginUserInfo } from '../../auth/interface/login.user';

@ApiTags('post')
@Controller('')
export class PostController {
  constructor(private postService: PostService) {}

  // ================================================================
  // C — Create
  // ================================================================
  @ApiOperation({
    summary: '게시글 작성 API',
    description: '로그인한 유저가 새 게시글을 작성합니다.',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: PostCreateResDto,
    description: '게시글 작성 성공 — 생성된 ID 반환',
  })
  @ApiUnauthorizedResponse({ description: '인증 토큰이 없거나 유효하지 않습니다.' })
  // ============================================
  @UseGuards(AuthUserAuthorizationGuard)
  @Post('/post')
  create(@User() user: ILoginUserInfo, @Body() getBody: PostCreateReqDto) {
    return this.postService.create(user, getBody);
  }

  // ================================================================
  // R — Read (목록 / 상세) — 인증 불필요
  // ================================================================
  @ApiOperation({
    summary: '게시글 목록 조회 API',
    description: '게시글 목록을 페이징하여 조회합니다.<br>' + '`keyword` 지정 시 제목/본문 부분 일치 검색.',
  })
  @ApiOkResponse({ type: PostGetListResDto, description: '목록 조회 성공' })
  // ============================================
  @Get('/post')
  getList(@Query() getQuery: PostGetListReqQueryDto) {
    return this.postService.getList(getQuery);
  }

  @ApiOperation({
    summary: '게시글 상세 조회 API',
    description: '게시글 ID로 상세 정보를 조회합니다.',
  })
  @ApiOkResponse({ type: PostGetDetailResDto, description: '상세 조회 성공' })
  @ApiNotFoundResponse({ description: '존재하지 않는 게시글입니다.' })
  // ============================================
  @Get('/post/:id')
  getById(@Param() getParam: PostGetByIdReqParamDto) {
    return this.postService.getById(getParam.id);
  }

  // ================================================================
  // U — Update (본인 글만)
  // ================================================================
  @ApiOperation({
    summary: '게시글 수정 API',
    description: '본인이 작성한 게시글만 수정할 수 있습니다. 보낸 필드만 변경됩니다.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: '수정 성공' })
  @ApiUnauthorizedResponse({ description: '인증 토큰이 없거나 유효하지 않습니다.' })
  @ApiForbiddenResponse({ description: '본인의 게시글이 아닙니다.' })
  @ApiNotFoundResponse({ description: '존재하지 않는 게시글입니다.' })
  // ============================================
  @UseGuards(AuthUserAuthorizationGuard)
  @Patch('/post/:id')
  update(
    @User() user: ILoginUserInfo,
    @Param() getParam: PostGetByIdReqParamDto,
    @Body() getBody: PostUpdateReqDto,
  ) {
    return this.postService.update(user, getParam.id, getBody);
  }

  // ================================================================
  // D — Delete (본인 글만, Soft Delete)
  // ================================================================
  @ApiOperation({
    summary: '게시글 삭제 API',
    description: '본인이 작성한 게시글만 삭제(Soft Delete)할 수 있습니다.',
  })
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: '삭제 성공' })
  @ApiUnauthorizedResponse({ description: '인증 토큰이 없거나 유효하지 않습니다.' })
  @ApiForbiddenResponse({ description: '본인의 게시글이 아닙니다.' })
  @ApiNotFoundResponse({ description: '존재하지 않는 게시글입니다.' })
  // ============================================
  @UseGuards(AuthUserAuthorizationGuard)
  @HttpCode(204)
  @Delete('/post/:id')
  delete(@User() user: ILoginUserInfo, @Param() getParam: PostGetByIdReqParamDto) {
    return this.postService.delete(user, getParam.id);
  }
}

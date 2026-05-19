import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AdminUserService } from '../application/admin.user.service';
import { AdminUserLoginReqDto } from './admin.user.req.dto';
import { AdminUserLoginResDto } from './admin.user.res.dto';

@ApiTags('/admin/user')
@Controller('')
export class AdminUserController {
  constructor(private adminUserService: AdminUserService) {}

  @ApiOperation({
    summary: '관리자 로그인 API',
    description: '이메일과 비밀번호로 관리자 로그인을 진행합니다.',
  })
  @ApiOkResponse({
    type: AdminUserLoginResDto,
    description: '로그인 성공 시 토큰 및 관리자 정보 반환',
  })
  @ApiBadRequestResponse({
    description: '이메일 또는 비밀번호가 일치하지 않습니다.<br>' + '비활성화된 계정입니다.',
  })
  @ApiUnauthorizedResponse({
    description: '토큰이 없거나 유효하지 않습니다.',
  })
  // ============================================
  @Post('/admin/login')
  login(@Body() getBody: AdminUserLoginReqDto) {
    return this.adminUserService.login(getBody);
  }
}

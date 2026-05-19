import { ApiProperty } from '@nestjs/swagger';
import { LoginTokenResDto } from '../../../auth/api/token.res.dto';
import { IAdminUserAuthority } from '../interface/admin.user.authority';

export class AdminUserLoginResDto extends LoginTokenResDto {
  @ApiProperty({
    type: String,
    description: '관리자 이름',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: '관리자 권한 ex) ADMIN, SUPER_ADMIN',
  })
  authority: IAdminUserAuthority;
}

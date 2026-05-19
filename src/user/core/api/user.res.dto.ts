import { ApiProperty } from '@nestjs/swagger';
import { LoginTokenResDto, TokenDto } from 'src/auth/api/token.res.dto';

export class UserLoginByEmailPasswordResDto extends LoginTokenResDto {
  @ApiProperty({
    type: String,
    description: '로그인한 유저의 이름 ',
  })
  // =====================================================
  readonly name: string;
}

export class UserAccessByRefreshResDto {
  @ApiProperty({
    type: TokenDto,
    description: 'access 토큰 정보',
  })
  // =====================================================
  readonly accessToken: TokenDto;
}

export class UserRefreshByRefreshResDto extends LoginTokenResDto {}

/**
 * 내 정보 조회 Response
 * - createdAt은 ISO 8601 문자열로 반환 (DateFormatStr 상수 사용)
 */
export class UserGetMyInfoResDto {
  @ApiProperty({ type: Number, description: '유저 ID' })
  readonly id: number;

  @ApiProperty({ type: String, description: '이메일' })
  readonly email: string;

  @ApiProperty({ type: String, description: '이름' })
  readonly name: string;

  @ApiProperty({
    type: String,
    description: '소셜 가입 provider (ex. GOOGLE, APPLE). 이메일 가입은 null',
    nullable: true,
  })
  readonly provider: string | null;

  @ApiProperty({
    type: String,
    description: '가입일시 (ISO 8601)',
    example: '2025-01-22T14:30:00',
  })
  readonly createdAt: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UserExistEmailReqDto {
  @ApiProperty({
    description: '중복 검사 하고자 하는 이메일',
  })
  // =======================
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

export class UserSignUpReqDto {
  @ApiProperty({
    type: String,
    description: '가입하고자 하는 email',
    example: 'test@example.com',
  })
  // =================================
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    type: String,
    description: '비밀번호 (최소 6자)',
    example: 'qwer1234',
  })
  // =================================
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  @ApiProperty({
    type: String,
    description: '이름',
    example: '홍길동',
  })
  // =================================
  @IsNotEmpty()
  readonly name: string;
}

export class UserGetAccessByRefreshReqDto {
  @ApiProperty({
    type: String,
    description: '발급받았던 refreshToken',
  })
  // ================================
  @IsNotEmpty()
  token: string;
}

export class UserGetRefreshByRefreshReqDto {
  @ApiProperty({
    type: String,
    description: '발급받았던 refreshToken',
  })
  // ================================
  @IsNotEmpty()
  token: string;
}

export class UserLoginByEmailPasswordReqDto {
  @ApiProperty({
    type: String,
    description: '가입한 이메일',
    example: 'test@example.com',
  })
  // =================================
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    type: String,
    description: '비밀번호',
    example: 'qwer1234',
  })
  // =================================
  @IsNotEmpty()
  readonly password: string;
}

/**
 * 내 정보 수정 Body DTO
 * - 보낸 필드만 수정되도록 모두 optional 처리
 */
export class UserUpdateMyInfoReqDto {
  @ApiPropertyOptional({
    type: String,
    description: '변경할 이름',
    example: '홍길동',
  })
  // =================================
  @IsOptional()
  @IsNotEmpty()
  readonly name?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class AdminUserLoginReqDto {
  @ApiProperty({
    type: String,
    description: '관리자 이메일',
    example: 'admin@example.com',
  })
  // ==========================================
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: '관리자 비밀번호',
    example: 'password123',
  })
  // ==========================================
  @IsNotEmpty()
  password: string;
}

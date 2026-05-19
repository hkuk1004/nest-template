import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUserEntity } from '../../../entity/admin.user.entity';
import { AdminUserLoginReqDto } from '../api/admin.user.req.dto';
import { PasswordBcryptEncrypt } from '../../../auth/infrastructure/password.bcrypt.encrypt';
import { ILoginTokenValidator } from '../../../auth/interface/login.token.validator';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(AdminUserEntity)
    private adminUserRepository: Repository<AdminUserEntity>,
    private passwordEncrypt: PasswordBcryptEncrypt,
    @Inject('ILoginTokenValidator')
    private loginTokenValidator: ILoginTokenValidator,
  ) {}

  async login(loginDto: AdminUserLoginReqDto) {
    const admin = await this.adminUserRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!admin) {
      throw new BadRequestException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // 비밀번호 비교
    const isMatch = await this.passwordEncrypt.compare(loginDto.password, admin.password);

    if (!isMatch) {
      throw new BadRequestException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // role이 ACTIVE인지 확인
    if (admin.role !== 'ACTIVE') {
      throw new BadRequestException('비활성화된 계정입니다.');
    }

    // Token 발급
    const tokens = this.loginTokenValidator.issuance({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      phoneNumber: null, // 관리자는 전화번호 불필요
      authority: admin.authority,
    });

    return {
      ...tokens,
      name: admin.name,
      authority: admin.authority,
    };
  }
}

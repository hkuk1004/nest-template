import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { format } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { UserLoginByEmailPasswordReqDto, UserSignUpReqDto, UserUpdateMyInfoReqDto } from '../api/user.req.dto';
import { UserGetMyInfoResDto } from '../api/user.res.dto';
import { PasswordBcryptEncrypt } from '../../../auth/infrastructure/password.bcrypt.encrypt';
import { ILoginTokenValidator } from '../../../auth/interface/login.token.validator';
import { UserEntity } from '../../../entity/user.entity';
import { ILoginUserInfo } from '../../../auth/interface/login.user';
import { DateFormatStr } from '../../../common/domain/date.format.str';

@Injectable()
export class UserService {
  constructor(
    private passwordEncrypt: PasswordBcryptEncrypt,
    @Inject('ILoginTokenValidator')
    private loginTokenValidator: ILoginTokenValidator,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async isExistEmail(email: string) {
    const dupEmailUser = await this.userRepository.findOne({
      where: { email },
    });
    return !!dupEmailUser;
  }

  @Transactional()
  async signUp(signUpDto: UserSignUpReqDto) {
    // 1. 이메일 중복 검사
    const dupEmail = await this.userRepository.count({
      where: { email: signUpDto.email },
    });
    if (dupEmail) {
      throw new BadRequestException('duplicate user email');
    }

    // 2. 비밀번호 암호화
    const passwordEncrypt = await this.passwordEncrypt.encrypt(signUpDto.password);

    // 3. 유저 계정 생성
    await this.userRepository.insert({
      email: signUpDto.email,
      password: passwordEncrypt,
      name: signUpDto.name,
    });
    return;
  }

  async loginByEmailPassword(loginDto: UserLoginByEmailPasswordReqDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('USER_DOES_NOT_EXIST');
    }
    if (!user.password || user.provider) {
      throw new BadRequestException('USER_DOES_NOT_SIGN_UP_EMAIL');
    }
    const isPasswordMatch = await this.passwordEncrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestException('USER_DO_NOT_MATCH_PASSWORD');
    }

    const loginUserInfo: ILoginUserInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { ...this.loginTokenValidator.issuance(loginUserInfo), name: user.name };
  }

  async getAccessByRefresh(token: string) {
    const userDecode = this.loginTokenValidator.validateByToken(token);

    const user = await this.userRepository.findOne({
      where: { id: userDecode.id },
    });
    if (!user) {
      throw new BadRequestException('USER_DOES_NOT_EXIST');
    }

    const loginToken = this.loginTokenValidator.issuance(userDecode);
    return { accessToken: loginToken.accessToken };
  }

  async getLoginTokenByRefresh(token: string) {
    const userDecode = this.loginTokenValidator.validateByToken(token);

    const user = await this.userRepository.findOne({
      where: { id: userDecode.id },
    });
    if (!user) {
      throw new BadRequestException('USER_DOES_NOT_EXIST');
    }

    return this.loginTokenValidator.issuance(userDecode);
  }

  // ================================================================
  // 회원정보 CRUD (R/U/D)
  // ================================================================

  /** 내 정보 조회 */
  async getMyInfo(loginUser: ILoginUserInfo): Promise<UserGetMyInfoResDto> {
    const user = await this.userRepository.findOne({
      where: { id: loginUser.id },
    });
    if (!user) {
      throw new NotFoundException('USER_DOES_NOT_EXIST');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
      createdAt: format(user.createdAt, DateFormatStr),
    };
  }

  /** 내 정보 수정 — 보낸 필드만 업데이트 */
  @Transactional()
  async updateMyInfo(loginUser: ILoginUserInfo, dto: UserUpdateMyInfoReqDto) {
    const user = await this.userRepository.findOne({
      where: { id: loginUser.id },
    });
    if (!user) {
      throw new NotFoundException('USER_DOES_NOT_EXIST');
    }

    // dto에 값이 들어온 필드만 update 객체에 담는다 (보낸 필드만 수정)
    const patch: Partial<UserEntity> = {};
    if (dto.name !== undefined) patch.name = dto.name;

    // 변경 사항이 없으면 쿼리 자체를 건너뜀
    if (Object.keys(patch).length === 0) return;

    await this.userRepository.update({ id: loginUser.id }, patch);
  }

  /** 회원 탈퇴 — Soft Delete (BaseEntity.deletedAt 사용) */
  async deleteMe(loginUser: ILoginUserInfo) {
    const user = await this.userRepository.findOne({
      where: { id: loginUser.id },
    });
    if (!user) {
      throw new NotFoundException('USER_DOES_NOT_EXIST');
    }

    await this.userRepository.softDelete({ id: loginUser.id });
  }
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entity/base.entity';
import { IAdminUserAuthority } from '../admin/admin_user/interface/admin.user.authority';
import { IAdminUserRole } from '../admin/admin_user/interface/admin.user.role';

@Entity('admin_user')
export class AdminUserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    unique: true,
    length: 200,
    comment: '관리자 이메일',
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '패스워드',
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '관리자 이름',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '핸드폰 번호 무선 전화',
  })
  phoneNumber: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '상태 ex) ACTIVE, STOP',
  })
  role: IAdminUserRole;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '권한 ex) ADMIN, SUPER_ADMIN',
  })
  authority: IAdminUserAuthority;
}

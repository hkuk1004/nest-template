import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entity/base.entity';
import { UserEntity } from './user.entity';

/**
 * 게시글 Entity
 * - BaseEntity 상속: createdAt, updatedAt, deletedAt 자동 포함 (Soft Delete 지원)
 * - DB 컬럼명은 SnakeNamingStrategy 에 의해 user_id, created_at 등으로 자동 변환됨
 */
@Index(['userId', 'createdAt']) // 작성자별 최신순 목록 조회 최적화
@Entity('post')
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: '작성자 유저 ID',
  })
  userId: number;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '게시글 제목',
  })
  title: string;

  @Column({
    type: 'text',
    comment: '게시글 본문',
  })
  content: string;

  // ── 관계 정의 ──────────────────────────────
  // FK 제약조건은 만들지 않음 (CLAUDE.md 규칙)
  // 응답에 join 으로 작성자 정보를 같이 담을 때 사용
  @ManyToOne(() => UserEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}

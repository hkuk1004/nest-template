import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { format } from 'date-fns';

import { PostEntity } from '../../entity/post.entity';
import { PostCreateReqDto, PostGetListReqQueryDto, PostUpdateReqDto } from '../api/post.req.dto';
import { PostCreateResDto, PostGetDetailResDto, PostGetListResDto, PostViewDto } from '../api/post.res.dto';
import { ILoginUserInfo } from '../../auth/interface/login.user';
import { DateFormatStr } from '../../common/domain/date.format.str';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {}

  /** 1) 게시글 생성 — 작성자는 로그인 유저 */
  @Transactional()
  async create(loginUser: ILoginUserInfo, dto: PostCreateReqDto): Promise<PostCreateResDto> {
    const inserted = await this.postRepository.insert({
      userId: loginUser.id,
      title: dto.title,
      content: dto.content,
    });

    // insert 결과에서 새로 생성된 PK 추출
    const id: number = inserted.identifiers[0].id;
    return { id };
  }

  /**
   * 2) 게시글 목록 조회 — 페이징 + 키워드 검색
   * - QueryBuilder로 한 번에 join (N+1 방지)
   * - 최신순 정렬
   */
  async getList(query: PostGetListReqQueryDto): Promise<PostGetListResDto> {
    const { page, take, keyword } = query;
    const skip = (page - 1) * take;

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .orderBy('post.createdAt', 'DESC');

    if (keyword) {
      qb.andWhere('(post.title LIKE :kw OR post.content LIKE :kw)', { kw: `%${keyword}%` });
    }

    const [posts, totalCount] = await qb.skip(skip).take(take).getManyAndCount();
    const totalPage = Math.ceil(totalCount / take);

    return {
      list: posts.map((p) => this.toView(p)),
      totalCount,
      totalPage,
      currentPage: page,
    };
  }

  /** 3) 게시글 상세 조회 */
  async getById(id: number): Promise<PostGetDetailResDto> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException('POST_DOES_NOT_EXIST');
    }
    return this.toView(post);
  }

  /**
   * 4) 게시글 수정 — 본인 글만 수정 가능
   * - 보낸 필드만 patch
   */
  @Transactional()
  async update(loginUser: ILoginUserInfo, id: number, dto: PostUpdateReqDto) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('POST_DOES_NOT_EXIST');
    }
    this.assertOwner(post, loginUser);

    const patch: Partial<PostEntity> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.content !== undefined) patch.content = dto.content;
    if (Object.keys(patch).length === 0) return;

    await this.postRepository.update({ id }, patch);
  }

  /**
   * 5) 게시글 삭제 — 본인 글만 삭제 가능 (Soft Delete)
   */
  @Transactional()
  async delete(loginUser: ILoginUserInfo, id: number) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('POST_DOES_NOT_EXIST');
    }
    this.assertOwner(post, loginUser);

    await this.postRepository.softDelete({ id });
  }

  // ──────────────────────────────────────────────
  // 내부 유틸
  // ──────────────────────────────────────────────

  /** 작성자 본인인지 검사. 아니면 ForbiddenException */
  private assertOwner(post: PostEntity, loginUser: ILoginUserInfo) {
    if (post.userId !== loginUser.id) {
      throw new ForbiddenException('NOT_POST_OWNER');
    }
  }

  /** PostEntity → PostViewDto 변환 (응답 평탄화) */
  private toView(post: PostEntity): PostViewDto {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.userId,
      authorName: post.user?.name ?? '',
      createdAt: format(post.createdAt, DateFormatStr),
      updatedAt: format(post.updatedAt, DateFormatStr),
    };
  }
}

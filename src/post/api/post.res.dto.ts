import { ApiProperty } from '@nestjs/swagger';
import { GetListResDto } from '../../common/api/dto/get.list.res.dto';

/**
 * 게시글 1건 표현용 View DTO
 * - 목록 / 상세 응답에서 재사용
 * - 작성자(user)는 join 결과 중 필요한 필드만 평탄화 (author* 로 prefix)
 */
export class PostViewDto {
  @ApiProperty({ type: Number, description: '게시글 ID' })
  readonly id: number;

  @ApiProperty({ type: String, description: '제목' })
  readonly title: string;

  @ApiProperty({ type: String, description: '본문' })
  readonly content: string;

  @ApiProperty({ type: Number, description: '작성자 유저 ID' })
  readonly authorId: number;

  @ApiProperty({ type: String, description: '작성자 이름' })
  readonly authorName: string;

  @ApiProperty({
    type: String,
    description: '작성일시 (ISO 8601)',
    example: '2025-01-22T14:30:00',
  })
  readonly createdAt: string;

  @ApiProperty({
    type: String,
    description: '최종 수정일시 (ISO 8601)',
    example: '2025-01-22T14:30:00',
  })
  readonly updatedAt: string;
}

/**
 * 게시글 단건 생성 Response — 생성된 ID만 반환
 */
export class PostCreateResDto {
  @ApiProperty({ type: Number, description: '생성된 게시글 ID' })
  readonly id: number;
}

/**
 * 게시글 단건 상세 조회 Response
 */
export class PostGetDetailResDto extends PostViewDto {}

/**
 * 게시글 목록 조회 Response
 * - GetListResDto 상속: totalPage, totalCount, currentPage 자동 포함
 */
export class PostGetListResDto extends GetListResDto {
  @ApiProperty({
    type: [PostViewDto],
    description: '게시글 목록',
  })
  readonly list: PostViewDto[];
}

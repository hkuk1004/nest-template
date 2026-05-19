import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { PagingReqDto } from '../../common/api/dto/pagination.req.dto';

/**
 * 게시글 생성 Body
 */
export class PostCreateReqDto {
  @ApiProperty({
    type: String,
    description: '게시글 제목 (최대 200자)',
    example: '안녕하세요, 첫 게시글입니다.',
  })
  // =================================
  @IsNotEmpty()
  @MaxLength(200)
  readonly title: string;

  @ApiProperty({
    type: String,
    description: '게시글 본문',
    example: '본문 내용을 입력합니다.',
  })
  // =================================
  @IsNotEmpty()
  readonly content: string;
}

/**
 * 게시글 수정 Body — 보낸 필드만 수정
 */
export class PostUpdateReqDto {
  @ApiPropertyOptional({
    type: String,
    description: '변경할 제목',
    example: '제목을 수정합니다',
  })
  // =================================
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(200)
  readonly title?: string;

  @ApiPropertyOptional({
    type: String,
    description: '변경할 본문',
  })
  // =================================
  @IsOptional()
  @IsNotEmpty()
  readonly content?: string;
}

/**
 * 단건 조회/수정/삭제 Path Param
 * - @Type(() => Number) 가 있어야 :id 의 문자열이 number 로 변환됨
 */
export class PostGetByIdReqParamDto {
  @ApiProperty({ type: Number, description: '게시글 ID', example: 1 })
  // =================================
  @Type(() => Number)
  readonly id: number;
}

/**
 * 게시글 목록 조회 Query
 * - PagingReqDto 상속 → page, take 자동 포함
 */
export class PostGetListReqQueryDto extends PagingReqDto {
  @ApiPropertyOptional({
    type: String,
    description: '제목/본문 부분 일치 검색',
    example: '안녕',
  })
  // =================================
  @IsOptional()
  readonly keyword?: string;
}

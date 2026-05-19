import { ConfigService } from '@nestjs/config';

/**
 * S3 URL 처리 헬퍼 함수들
 * - DB에는 상대 경로만 저장하고, 조회 시 full URL로 변환
 * - 버킷 변경 시 DB 마이그레이션 불필요
 * - 환경별(dev/staging/prod) 분리 용이
 */

/**
 * S3 URL에서 prefix 제거하여 상대 경로만 반환
 * @param configService - NestJS ConfigService
 * @param fullUrl - S3 전체 URL (예: https://bpm-prod-images-2026.s3.amazonaws.com/image/1234.jpg)
 * @returns 상대 경로 (예: image/1234.jpg)
 */
export function stripS3Prefix(configService: ConfigService, fullUrl: string): string {
  if (!fullUrl) return fullUrl;
  const prefix = configService.get<string>('S3_BUCKET_URL') ?? '';
  return fullUrl.replace(prefix, '');
}

/**
 * 상대 경로에 S3 prefix 추가하여 전체 URL 반환
 * @param configService - NestJS ConfigService
 * @param path - 상대 경로 (예: image/1234.jpg)
 * @returns S3 전체 URL (예: https://bpm-prod-images-2026.s3.amazonaws.com/image/1234.jpg)
 */
export function addS3Prefix(configService: ConfigService, path: string): string {
  if (!path) return path;
  const prefix = configService.get<string>('S3_BUCKET_URL') ?? '';
  return `${prefix}${path}`;
}

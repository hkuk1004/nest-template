import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { PostEntity } from '../entity/post.entity';
import { PostController } from './api/post.controller';
import { PostService } from './application/post.service';

@Module({
  imports: [
    AuthModule, // AuthUserAuthorizationGuard 가 의존하는 ILoginTokenValidator 사용
    TypeOrmModule.forFeature([PostEntity]),
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}

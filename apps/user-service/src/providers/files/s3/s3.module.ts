import * as AWS from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';

import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    S3Service,
    {
      provide: S3Lib,
      useFactory: (config: ConfigService) => {
        return new AWS.S3({
          endpoint: config.get<string>('S3_ENDPOINT'),
          region: 'ru-central1',
          credentials: {
            accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY'),
            secretAccessKey: config.getOrThrow<string>('S3_SECRET_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [S3Service, S3Lib],
})
export class S3Module {}

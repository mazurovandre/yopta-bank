import { Module } from '@nestjs/common';
import { AVATARS_REPOSITORY } from '@features/avatars/repositories/avatars.interface';
import { AvatarsService } from '@features/avatars/avatars.service';
import { AvatarsController } from '@features/avatars/avatars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../../providers/files/files.module';
import { Avatar } from '@features/avatars/entities/avatar.entity';
import { TypeOrmAvatarsRepository } from '@features/avatars/repositories/typeorm-avatars.repository';
import { TokenModule } from '@libs/token/token.module';

@Module({
  controllers: [AvatarsController],
  providers: [
    AvatarsService,
    {
      provide: AVATARS_REPOSITORY,
      useClass: TypeOrmAvatarsRepository,
    },
  ],
  imports: [TypeOrmModule.forFeature([Avatar]), FilesModule, TokenModule],
})
export class AvatarsModule {}

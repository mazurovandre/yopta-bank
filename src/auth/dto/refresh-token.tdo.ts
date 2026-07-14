import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  access_token: string;

  @IsString()
  refresh_token: string;
}

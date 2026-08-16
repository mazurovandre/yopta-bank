import { IsInt, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferBalanceDto {
  @IsInt()
  recipientId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount: number;
}

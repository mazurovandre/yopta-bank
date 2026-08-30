import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BalanceResetService } from '@features/balance-reset/balance-reset.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TokenGuard } from '@libs/token/token.guard';

@ApiTags('balance-reset')
@ApiBearerAuth()
@UseGuards(TokenGuard)
@Controller('balance-reset')
export class BalanceResetController {
  constructor(private readonly balanceResetService: BalanceResetService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async balanceReset(): Promise<{ jobId?: string }> {
    const jobId = await this.balanceResetService.balanceReset();

    return { jobId };
  }
}

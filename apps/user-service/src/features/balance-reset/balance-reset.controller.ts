import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BalanceResetService } from '@features/balance-reset/balance-reset.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@auth/auth.guard';

@ApiTags('balance-reset')
@ApiBearerAuth()
@UseGuards(AuthGuard)
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

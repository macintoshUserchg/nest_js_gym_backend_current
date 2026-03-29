import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RemindersService } from './reminders.service';

@ApiTags('members')
@Controller('members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MembersRemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post(':memberId/reminders/due')
  @ApiOperation({ summary: 'Send manual due reminder for a member' })
  sendDueReminder(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.remindersService.sendManualDueReminder(memberId);
  }

  @Post(':memberId/reminders/expiry')
  @ApiOperation({ summary: 'Send manual expiry reminder for a member' })
  sendExpiryReminder(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.remindersService.sendManualExpiryReminder(memberId);
  }

  @Get(':memberId/reminders/latest')
  @ApiOperation({ summary: 'Get latest reminder metadata for a member' })
  getLatest(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.remindersService.getLatestReminderSummary(memberId);
  }
}

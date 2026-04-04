import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Body,
  UseGuards,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RenewalsService } from './renewals.service';
import { CreateRenewalRequestDto } from './dto/create-renewal-request.dto';
import { paginate } from '../common/dto/pagination.dto';

@ApiTags('renewals')
@Controller('renewals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RenewalsController {
  constructor(private readonly renewalsService: RenewalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all renewal requests' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.renewalsService.findAll(page, limit);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a renewal request' })
  cancel(@Param('id') id: string) {
    return this.renewalsService.cancel(id);
  }
}

@ApiTags('members')
@Controller('members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MemberRenewalsController {
  constructor(private readonly renewalsService: RenewalsService) {}

  @Post(':memberId/renewals')
  @ApiOperation({ summary: 'Create renewal request for a member' })
  create(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() body: CreateRenewalRequestDto,
  ) {
    return this.renewalsService.createForMember(memberId, body);
  }

  @Get(':memberId/renewals')
  @ApiOperation({ summary: 'Get renewal requests for a member' })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.renewalsService.findByMember(memberId);
  }
}

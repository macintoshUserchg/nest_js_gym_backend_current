import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestMobileOtpDto {
  @ApiProperty({
    description: 'Mobile number in local or E.164 format',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

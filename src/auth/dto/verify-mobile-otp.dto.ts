import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyMobileOtpDto {
  @ApiProperty({
    description: 'Mobile number used for OTP verification',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Verification code sent by SMS',
    example: '123456',
  })
  @IsString()
  @Length(4, 10)
  code: string;
}

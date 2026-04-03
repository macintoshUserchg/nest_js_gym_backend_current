import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, IsNotEmpty, IsString, Length} from 'class-validator';

export class VerifyMobileOtpDto {
  @ApiProperty({
    description: 'Mobile number used for OTP verification',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  phoneNumber: string;

  @ApiProperty({
    description: 'Verification code sent by SMS',
    example: '123456',
  })
  @IsString()
  @Length(4, 10)
  @MaxLength(255)
  code: string;
}

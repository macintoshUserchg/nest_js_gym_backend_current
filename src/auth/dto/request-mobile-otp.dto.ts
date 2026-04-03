import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, IsNotEmpty, IsString} from 'class-validator';

export class RequestMobileOtpDto {
  @ApiProperty({
    description: 'Mobile number in local or E.164 format',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  phoneNumber: string;
}

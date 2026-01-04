import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGymDto {
  @ApiProperty({ description: 'Gym name', example: 'FitZone Fitness' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Gym email address',
    example: 'contact@fitzone.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Gym phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description:
      'Gym logo URL or file path. Supports multiple formats: local file paths, relative paths, full URLs (HTTP/HTTPS), and CDN URLs. Recommended image formats: PNG, JPG, JPEG, SVG. Maximum recommended size: 2MB.',
    examples: {
      localPath: {
        value: '/uploads/gym-logos/fitzone-logo.png',
        description: 'Local server file path',
      },
      relativePath: {
        value: 'assets/logos/fitzone-logo.jpg',
        description: 'Relative path from application root',
      },
      fullUrl: {
        value: 'https://example.com/logos/fitzone-logo.png',
        description: 'Full HTTPS URL to logo image',
      },
      cdnUrl: {
        value: 'https://cdn.example.com/gym-assets/logos/fitzone-logo.svg',
        description: 'CDN URL for optimized delivery',
      },
      httpUrl: {
        value: 'http://assets.fitzone.com/logo.png',
        description: 'HTTP URL (not recommended for production)',
      },
    },
    format: 'uri',
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Gym address',
    example: '123 Main St, City, State',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Gym location/city',
    example: 'Los Angeles',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Gym state', example: 'CA' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Gym latitude', example: 34.0522 })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Gym longitude', example: -118.2437 })
  @IsOptional()
  longitude?: number;
}

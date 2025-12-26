import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @Post('login')
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns JWT token for subsequent API calls.'
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
    type: LoginResponseDto,
    examples: {
      success: {
        summary: 'Successful login response',
        value: {
          userid: 'usr_1234567890abcdef',
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMTIzNDU2Nzg5MCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJNRU1CRVIiLCJpYXQiOjE2MzM4MzA2MDAsImV4cCI6MTYzMzgzNDIwMH0.example_signature'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials.',
    examples: {
      invalidCredentials: {
        summary: 'Invalid login credentials',
        value: {
          statusCode: 401,
          message: 'Invalid email or password',
          error: 'Unauthorized'
        }
      }
    }
  })
  @ApiBody({ 
    type: LoginUserDto,
    examples: {
      valid: {
        value: {
          email: 'member@example.com',
          password: 'SecurePassword123!'
        }
      }
    }
  })
  async login(@Body() loginDto: LoginUserDto): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.authService.login(user);
    return {
      userid: user.userId,
      access_token: token,
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @ApiOperation({ 
    summary: 'User logout',
    description: 'Logout user and invalidate JWT token. Client should discard the token after successful logout.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User logged out successfully.',
    examples: {
      success: {
        summary: 'Successful logout',
        value: {
          message: 'Logged out successfully. Please discard your token.'
        }
      }
    }
  })
  async logout() {
    // For JWT, logout is typically client-side by discarding the token.
    // This endpoint can be used to acknowledge the logout or perform server-side cleanup if a token blacklist/revocation is implemented.
    return { message: 'Logged out successfully. Please discard your token.' };
  }
}

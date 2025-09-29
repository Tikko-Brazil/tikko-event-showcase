import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  GoneException,
  UnprocessableEntityException,
  TooManyRequestsException,
  InternalServerErrorException,
} from './exceptions';
import {
  ExchangeRequest,
  ExchangeResponse,
  RefreshRequest,
  RefreshResponse,
  SignupRequest,
  SignupResponse,
  VerifyRequest,
  VerifyResponse,
  RegenerateCodeRequest,
  RegenerateCodeResponse,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './types';

const ERROR_MESSAGES = {
  exchange: {
    400: 'Missing authorization code or code verifier',
    401: 'Google authentication failed',
    500: 'Server error during authentication'
  },
  refresh: {
    400: 'Missing refresh token',
    401: 'Invalid or expired refresh token'
  },
  signup: {
    400: 'Invalid request or missing required fields',
    409: 'User already exists with this email',
    422: 'Password is too weak or authentication method error',
    500: 'Server error during registration'
  },
  verify: {
    400: 'Invalid request or missing required fields',
    401: 'Invalid verification code',
    404: 'No verification record found',
    410: 'Verification code expired or already used',
    429: 'Too many verification attempts'
  },
  regenerateCode: {
    400: 'Missing email address',
    404: 'User not found',
    409: 'Email already verified',
    429: 'Too many regeneration attempts or wait required'
  },
  login: {
    400: 'Invalid request or missing required fields',
    401: 'Invalid credentials or email not verified',
    403: 'Authentication method error'
  },
  forgotPassword: {
    400: 'Missing email address',
    409: 'Cannot reset password for OAuth users',
    429: 'Too many reset attempts or wait required',
    500: 'Server error during password reset'
  },
  resetPassword: {
    400: 'Invalid request or missing required fields',
    404: 'Invalid reset token or user not found',
    410: 'Reset token expired or already used',
    422: 'Password is too weak',
    500: 'Server error during password reset'
  }
};

export class AuthGateway {
  constructor(private baseUrl: string) {}

  private async handleResponse<T>(response: Response, endpoint: keyof typeof ERROR_MESSAGES): Promise<T> {
    const data = await response.json();
    
    if (response.status === 200 || response.status === 201) {
      return data;
    }

    const messages = ERROR_MESSAGES[endpoint] as Record<number, string>;
    const message = messages[response.status] || data.message || 'Unknown error';
    
    switch (response.status) {
      case 400:
        throw new BadRequestException(message);
      case 401:
        throw new UnauthorizedException(message);
      case 403:
        throw new ForbiddenException(message);
      case 404:
        throw new NotFoundException(message);
      case 409:
        throw new ConflictException(message);
      case 410:
        throw new GoneException(message);
      case 422:
        throw new UnprocessableEntityException(message);
      case 429:
        throw new TooManyRequestsException(message);
      case 500:
        throw new InternalServerErrorException(message);
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  }

  async exchange(request: ExchangeRequest): Promise<ExchangeResponse> {
    const response = await fetch(`${this.baseUrl}/public/login/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return this.handleResponse<ExchangeResponse>(response, 'exchange');
  }

  async refresh(request: RefreshRequest): Promise<RefreshResponse> {
    const response = await fetch(`${this.baseUrl}/public/login/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return this.handleResponse<RefreshResponse>(response, 'refresh');
  }

  async signup(request: SignupRequest): Promise<SignupResponse> {
    const response = await fetch(`${this.baseUrl}/public/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return this.handleResponse<SignupResponse>(response, 'signup');
  }

  async verify(request: VerifyRequest): Promise<VerifyResponse> {
    const response = await fetch(`${this.baseUrl}/public/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return this.handleResponse<VerifyResponse>(response, 'verify');
  }

  async regenerateCode(request: RegenerateCodeRequest): Promise<RegenerateCodeResponse> {
    const response = await fetch(`${this.baseUrl}/public/regenerate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return this.handleResponse<RegenerateCodeResponse>(response, 'regenerateCode');
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/public/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return this.handleResponse<LoginResponse>(response, 'login');
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${this.baseUrl}/public/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return this.handleResponse<ForgotPasswordResponse>(response, 'forgotPassword');
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await fetch(`${this.baseUrl}/public/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return this.handleResponse<ResetPasswordResponse>(response, 'resetPassword');
  }
}

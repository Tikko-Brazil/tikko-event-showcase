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
import i18n from '../i18n';
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
  CompleteProfileRequest,
  CompleteProfileResponse,
} from './types';

export class AuthGateway {
  constructor(private baseUrl: string) {}

  private async handleResponse<T>(response: Response, endpoint: string): Promise<T> {
    const data = await response.json();
    
    if (response.status === 200 || response.status === 201) {
      return data;
    }

    const errorKey = `auth.errors.${endpoint}.${response.status}`;
    const message = i18n.isInitialized && i18n.exists && i18n.exists(errorKey) 
      ? i18n.t(errorKey) 
      : data.message || (i18n.isInitialized ? i18n.t('auth.errors.unknown') : 'Unknown error');
    
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

  async completeProfile(request: CompleteProfileRequest, accessToken: string): Promise<CompleteProfileResponse> {
    const response = await fetch(`${this.baseUrl}/complete-profile`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao completar perfil');
    }
    
    return response.json();
  }
}

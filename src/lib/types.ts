export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_first_access: boolean;
  gender: string;
  birthday: string;
  phone_number: string;
  location: string;
  bio: string;
  instagram_profile: string;
  is_verified: boolean;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

// Exchange requests/responses
export interface ExchangeRequest {
  code: string;
  redirectUri: string;
  codeVerifier: string;
  identity_provider: string;
}

export interface ExchangeResponse {
  user: User;
  token_pair: TokenPair;
}

// Refresh requests/responses
export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  token_pair: TokenPair;
}

// Signup requests/responses
export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  gender: string;
  phone_number: string;
  location: string;
  bio: string;
  instagram_profile: string;
}

export interface SignupResponse {
  message: string;
  email: string;
  next_regenerate_in: number;
}

// Verify requests/responses
export interface VerifyRequest {
  email: string;
  code: string;
}

export interface VerifyResponse {
  user: User;
  token_pair: TokenPair;
}

// Regenerate code requests/responses
export interface RegenerateCodeRequest {
  email: string;
}

export interface RegenerateCodeResponse {
  message: string;
  email: string;
  is_last_attempt: boolean;
  attempts_left: number;
  next_regenerate_in: number;
}

// Login requests/responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token_pair: TokenPair;
}

// Forgot password requests/responses
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

// Reset password requests/responses
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
  email: string;
}

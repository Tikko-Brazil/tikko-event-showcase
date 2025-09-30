import { createFetchWithAuth } from "./fetchWithAuth";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  gender: string;
  birthday: string;
  phone_number: string;
  location: string;
  bio: string;
  instagram_profile: string;
  companies_following: number[];
  is_first_access: boolean;
  auth_method: string;
  is_verified: boolean;
}

interface UpdateUserRequest {
  username: string;
  gender: string;
  birthday: string;
  phone_number: string;
  location: string;
  bio: string;
  instagram_profile: string;
  companies_following: number[];
}

interface RegisterAndJoinEventRequest {
  user: {
    email: string;
    username: string;
    gender: string;
    birthday: string;
    phone_number: string;
    location: string;
    bio: string;
    instagram_profile: string;
  };
  event_id: number;
  ticket_pricing_id: number;
  coupon: string;
  payment: PaymentData;
}

interface JoinEventRequest {
  event_id: number;
  ticket_pricing_id: number;
  coupon: string;
  payment: PaymentData;
}

interface PaymentData {
  transaction_amount: number;
  token: string;
  description: string;
  installments: number;
  payment_method_id: string;
  issuer_id: number;
  capture: boolean;
  external_reference: string;
  callback_url: string;
  additional_info: {
    items: Array<{
      id: string;
      title: string;
      description: string;
    }>;
    payer: {
      first_name: string;
      last_name: string;
    };
  };
  payer: object;
}

interface EventJoinResponse {
  user_id: number;
  event_id: number;
  payment_id: string;
  status: string;
  payment_url: string;
}

interface TicketByEmailRequest {
  email: string;
}

interface TicketByEmailResponse {
  ticket_uuid: string;
}

export class UserGateway {
  private baseUrl: string;
  private fetchWithAuth: (
    url: string,
    options?: RequestInit
  ) => Promise<Response>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.fetchWithAuth = createFetchWithAuth(baseUrl);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  }

  async getUser(id: number): Promise<User> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/user/${id}`,
      {
        method: "GET",
      }
    );
    return this.handleResponse<User>(response);
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/user/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(userData),
      }
    );
    return this.handleResponse<User>(response);
  }

  async updateCurrentUser(userData: UpdateUserRequest): Promise<User> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/private/user`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    return this.handleResponse<User>(response);
  }

  async registerAndJoinEvent(
    data: RegisterAndJoinEventRequest
  ): Promise<EventJoinResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/user/register-and-join-event`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<EventJoinResponse>(response);
  }

  async joinEvent(data: JoinEventRequest): Promise<EventJoinResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/user/join-event`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<EventJoinResponse>(response);
  }

  async getTicketByEmail(
    data: TicketByEmailRequest
  ): Promise<TicketByEmailResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/ticket/by-email`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<TicketByEmailResponse>(response);
  }
}

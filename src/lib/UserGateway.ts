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

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getUser(id: number): Promise<User> {
    const response = await fetch(`${this.baseUrl}/private/user/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${this.baseUrl}/private/user/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<User>(response);
  }

  async updateCurrentUser(userData: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${this.baseUrl}/private/user`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<User>(response);
  }

  async registerAndJoinEvent(data: RegisterAndJoinEventRequest): Promise<EventJoinResponse> {
    const response = await fetch(`${this.baseUrl}/private/user/register-and-join-event`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<EventJoinResponse>(response);
  }

  async joinEvent(data: JoinEventRequest): Promise<EventJoinResponse> {
    const response = await fetch(`${this.baseUrl}/private/user/join-event`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<EventJoinResponse>(response);
  }

  async getTicketByEmail(data: TicketByEmailRequest): Promise<TicketByEmailResponse> {
    const response = await fetch(`${this.baseUrl}/private/ticket/by-email`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<TicketByEmailResponse>(response);
  }
}

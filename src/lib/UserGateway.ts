import { createFetchWithAuth } from "./fetchWithAuth";
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from "./exceptions";

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
  additional_info?: {
    items: Array<{
      id: string;
      title: string;
      description: string;
      category_id: string;
      quantity: number;
      unit_price: number;
    }>;
    payer: {
      first_name: string;
      last_name: string;
    };
  };
  payer: {
    email: string;
    first_name: string;
    last_name: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

interface EventJoinResponse {
  user_id: number;
  event_id: number;
  payment_id: number;
  status: string;
  payment_url: string;
  qr_code?: string;
}

interface TicketByEmailRequest {
  email: string;
}

interface TicketByEmailResponse {
  ticket_uuid: string;
}

interface DashboardEvent {
  id: number;
  name: string;
  description: string;
  is_paid: boolean;
  start_date: string;
  end_date: string;
  address_name: string;
  longitude: number;
  latitude: number;
  address_complement: string;
  is_private: boolean;
  auto_accept: boolean;
  company_id: number;
  is_active: boolean;
  image: string;
}

interface DashboardTopEvent {
  event: DashboardEvent;
  participant_count: number;
}

interface DashboardUser {
  username: string;
  email: string;
  is_admin: boolean;
}

interface DashboardResponse {
  top_events: DashboardTopEvent[];
  user: DashboardUser;
}

const ERROR_MESSAGES = {
  getUser: {
    200: "Success (but returns null)",
  },
  updateUserById: {
    400: "Invalid data",
    401: "Unauthorized",
    500: "Internal Server Error",
  },
  updateUser: {
    400: "Invalid data",
    401: "Unauthorized",
    500: "Internal Server Error",
  },
  registerAndJoinEvent: {
    400: "Missing required fields: instagram_profile, phone_number, email, username, gender",
    409: "User already has pending ticket or already bought ticket",
    500: "Internal Server Error",
  },
  joinEvent: {
    400: "Invalid request body",
    401: "Unauthorized",
    409: "User already has pending ticket or already bought ticket",
    500: "Internal Server Error",
  },
  getTicketByEmail: {
    400: "Invalid request body or missing email",
    403: "Ticket is not Door",
    404: "User not found or ticket not found",
    500: "Internal Server Error",
  },
  getDashboard: {
    401: "Unauthorized (invalid token)",
    404: "Not Found (user not found)",
    500: "Internal Server Error",
  },
};

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

  private async handleResponse<T>(
    response: Response,
    endpoint: keyof typeof ERROR_MESSAGES
  ): Promise<T> {
    const data = await response.json().catch(() => ({}));

    if (response.status === 200 || response.status === 201) {
      return data;
    }

    const messages = ERROR_MESSAGES[endpoint] as Record<number, string>;
    const message =
      messages[response.status] || data.message || "Unknown error";

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
      case 500:
        throw new InternalServerErrorException(message);
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  }

  async getUser(id: number): Promise<User | null> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/user/${id}`,
      {
        method: "GET",
      }
    );
    return this.handleResponse<User | null>(response, "getUser");
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/user/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(userData),
      }
    );
    return this.handleResponse<User>(response, "updateUserById");
  }

  async updateCurrentUser(userData: UpdateUserRequest): Promise<User> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/private/user`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    return this.handleResponse<User>(response, "updateUser");
  }

  async registerAndJoinEvent(
    data: RegisterAndJoinEventRequest
  ): Promise<EventJoinResponse> {
    const response = await fetch(
      `${this.baseUrl}/public/user/register-and-join-event`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<EventJoinResponse>(
      response,
      "registerAndJoinEvent"
    );
  }

  async joinEvent(data: JoinEventRequest): Promise<EventJoinResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/user/join-event`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<EventJoinResponse>(response, "joinEvent");
  }

  async getTicketByEmail(
    data: TicketByEmailRequest
  ): Promise<TicketByEmailResponse> {
    const response = await fetch(`${this.baseUrl}/public/ticket/by-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<TicketByEmailResponse>(
      response,
      "getTicketByEmail"
    );
  }

  async getDashboard(): Promise<DashboardResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/dashboard`,
      {
        method: "GET",
      }
    );
    return this.handleResponse<DashboardResponse>(response, "getDashboard");
  }
}

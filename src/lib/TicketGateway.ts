import { createFetchWithAuth } from "./fetchWithAuth";

interface Ticket {
  uuid: string;
  event_id?: number;
  user_id?: number;
  ticket_pricing_id: number;
  already_validated: boolean;
  validated_by?: number;
  validation_date?: string;
  qr_code?: string;
  ticket_type?: string;
  gender?: string;
  lot?: number;
  price?: number;
  purchased_at?: string;
}

interface TicketWithEvent {
  ticket: Ticket;
  event: {
    id: number;
    name: string;
    date: string;
    address_name: string;
  };
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
}

interface UserTicketsResponse {
  tickets: TicketWithEvent[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface CreateTicketRequest {
  event_id: number;
  user_id: number;
  ticket_pricing_id: number;
  ticket_label: string;
}

interface UpdateTicketRequest {
  ticket_label: string;
}

interface ValidateTicketResponse {
  message: string;
  ticket: Ticket;
}

interface TicketDownloadResponse {
  download_url: string;
  expires_in: number;
}

interface GetTicketByEmailRequest {
  email: string;
}

export class TicketGateway {
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

  // Private endpoints
  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/private/ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return this.handleResponse<Ticket>(response);
  }

  async getTicket(uuid: string): Promise<Ticket> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/private/ticket/${uuid}`);
    return this.handleResponse<Ticket>(response);
  }

  async updateTicket(uuid: string, data: UpdateTicketRequest): Promise<Ticket> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/private/ticket/${uuid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return this.handleResponse<Ticket>(response);
  }

  async deleteTicket(uuid: string): Promise<{ message: string }> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/private/ticket/${uuid}`, {
      method: "DELETE",
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async validateTicket(uuid: string): Promise<ValidateTicketResponse> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/private/ticket/${uuid}`, {
      method: "POST",
    });
    return this.handleResponse<ValidateTicketResponse>(response);
  }

  async getUserTickets(page: number, limit: number): Promise<UserTicketsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.fetchWithAuth(`${this.baseUrl}/private/tickets/user?${params}`);
    return this.handleResponse<UserTicketsResponse>(response);
  }

  async getTicketDownloadUrl(userId: number, eventId: number): Promise<TicketDownloadResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/ticket/download?user_id=${userId}&event_id=${eventId}`
    );
    return this.handleResponse<TicketDownloadResponse>(response);
  }

  // Public endpoints
  async getTicketByEmail(data: GetTicketByEmailRequest): Promise<Ticket> {
    const response = await fetch(`${this.baseUrl}/public/ticket/by-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return this.handleResponse<Ticket>(response);
  }
}

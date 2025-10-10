import { createFetchWithAuth } from "./fetchWithAuth";

interface Event {
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
  ticket_pricing_id: number;
  is_active: boolean;
  image: string;
  location: string;
  created_at: string;
  updated_at: string;
}

interface TicketPricing {
  id: number;
  event_id: number;
  ticket_type: string;
  price: number;
  start_date: string;
  end_date: string;
  gender: string;
  male_capacity: number;
  female_capacity: number;
  lot: number;
}

interface CreateTicketPricingRequest {
  ticket_type: string;
  price: number;
  start_date: string;
  end_date: string;
  gender: string;
  active: boolean;
}

interface CreateEventRequest {
  event: {
    name: string;
    description: string;
    is_paid?: boolean;
    start_date: string;
    end_date: string;
    address_name: string;
    longitude: number;
    latitude: number;
    address_complement: string;
    is_private: boolean;
    auto_accept: boolean;
    company_id?: number;
    is_active: boolean;
    image: string;
  };
  ticket_pricing: CreateTicketPricingRequest[];
}

interface UpdateEventRequest {
  name: string;
  description: string;
  image: string;
  start_date: string;
  end_date: string;
  address_name: string;
  longitude: number;
  latitude: number;
  address_complement: string;
  is_private: boolean;
  auto_accept: boolean;
  is_active: boolean;
}

interface EventWithTicketPricing {
  event: Event;
  ticket_pricing: TicketPricing[];
}

interface CreateEventResponse {
  event: Event;
  ticket_pricing: TicketPricing[];
}

interface EventStats {
  total_tickets_sold: number;
  paid_tickets: number;
  free_tickets: number;
  total_invites: number;
  total_pending_invites: number;
  total_rejected_invites: number;
  total_accepted_invites: number;
  tickets_sold_by_pricing: {
    ticket_pricing_id: number;
    ticket_type: string;
    lot: number;
    price: number;
    tickets_sold: number;
    total_revenue: number;
  }[];
  total_revenue: number;
  total_validated_tickets: number;
  role_distribution: {
    role_id: number;
    role_name: string;
    user_count: number;
  }[];
  total_tickets_sold_by_gender: {
    total_female_tickets_sold: number;
    total_male_tickets_sold: number;
  };
  age_stats: {
    average_age_all: number;
    average_age_male: number;
    average_age_female: number;
    age_distribution: {
      age_range: string;
      count: number;
      percentage: number;
    }[];
  };
  total_visits: number;
  conversion_rate: number;
}

interface DailySales {
  date: string;
  total_sales: number;
  paid_sales: number;
  free_sales: number;
  percentage_change: number | null;
}

interface AssignRoleRequest {
  user_id: number;
  role: string;
}

interface UploadUrlResponse {
  upload_url: string;
  key: string;
}

interface UserEventResponse {
  events: {
    event: Event;
    role: string;
    has_sold_tickets: boolean;
    is_admin: boolean;
  }[];
}

export class EventGateway {
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

  // Public endpoints
  async getEvent(id: number): Promise<Event> {
    const response = await fetch(`${this.baseUrl}/public/event/${id}`);
    return this.handleResponse<Event>(response);
  }

  async getAllEvents(): Promise<Event[]> {
    const response = await fetch(`${this.baseUrl}/public/event`);
    return this.handleResponse<Event[]>(response);
  }

  async getEventWithTicketPricing(id: number): Promise<EventWithTicketPricing> {
    const response = await fetch(
      `${this.baseUrl}/public/event/${id}/with-ticket-pricing`
    );
    return this.handleResponse<EventWithTicketPricing>(response);
  }

  // Private endpoints
  async createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/private/event`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return this.handleResponse<CreateEventResponse>(response);
  }

  async updateEvent(id: number, data: UpdateEventRequest): Promise<Event> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<Event>(response);
  }

  async deleteEvent(id: number): Promise<void> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
  }

  async getEventStats(id: number, days?: number): Promise<EventStats> {
    const url = new URL(`${this.baseUrl}/private/event/${id}/stats`);
    if (days !== undefined) {
      url.searchParams.append("days", days.toString());
    }

    const response = await this.fetchWithAuth(url.toString());
    return this.handleResponse<EventStats>(response);
  }

  async getEventDailySales(id: number, days?: number): Promise<DailySales[]> {
    const url = new URL(
      `${this.baseUrl}/private/event/${id}/stats/daily-sales`
    );
    if (days !== undefined) {
      url.searchParams.append("days", days.toString());
    }

    const response = await this.fetchWithAuth(url.toString());
    return this.handleResponse<DailySales[]>(response);
  }

  async getUserEvents(): Promise<UserEventResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/user`
    );
    return this.handleResponse<UserEventResponse>(response);
  }

  async assignRole(id: number, data: AssignRoleRequest): Promise<void> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/${id}/role`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
  }

  async getUploadUrl(
    filename: string,
    contentType?: string
  ): Promise<UploadUrlResponse> {
    const params = new URLSearchParams({ filename });
    if (contentType) {
      params.append("content_type", contentType);
    }

    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/upload-url?${params}`
    );
    return this.handleResponse<UploadUrlResponse>(response);
  }
}

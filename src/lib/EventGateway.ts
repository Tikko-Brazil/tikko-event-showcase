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
  participant_count: number;
}

interface PaginatedEventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface GetEventsParams {
  active?: "true" | "false" | "all";
  search?: string;
  order_by_participants?: boolean;
  page: number;
  limit: number;
}

interface UserEventData {
  event: Event;
  role: string;
  has_sold_tickets: boolean;
}

interface PaginatedUserEventsResponse {
  events: UserEventData[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  is_admin: boolean;
}

interface GetUserEventsParams {
  active?: "true" | "false" | "all";
  search?: string;
  page: number;
  limit: number;
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

interface ValidatedTickets {
  timestamp: string;
  count: number;
}

interface EventStatsOverview {
  total_sold_tickets: number;
  liquid_revenue: number;
  conversion_rate: number;
  average_age: number;
  recent_activity: {
    action: number;
    user_name: string;
    time_ago: number;
  }[];
}

interface EventInfo {
  id: number;
  name: string;
  description: string;
  is_paid: boolean;
  start_date: string;
  end_date: string | null;
  address_name: string | null;
  longitude: number | null;
  latitude: number | null;
  address_complement: string | null;
  is_private: boolean;
  auto_accept: boolean;
  company_id: number | null;
  ticket_pricing_id: number | null;
  is_active: boolean;
  user_role: string | null;
}

interface EventStaffMember {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  birthday: string;
  gender: string;
  location: string;
  instagram_profile: string;
  role: string;
}

interface PaginatedStaffResponse {
  staff: EventStaffMember[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface AddStaffRequest {
  email: string;
  role: string;
}

interface AddStaffResponse {
  message: string;
}

interface UpdateStaffRoleRequest {
  role: string;
}

interface UpdateStaffRoleResponse {
  message: string;
}

interface UploadUrlResponse {
  upload_url: string;
  key: string;
}

interface PaginatedUserEventsResponse {
  events: UserEventData[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
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

  async getEvents(params: GetEventsParams): Promise<PaginatedEventsResponse> {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    });

    if (params.active) {
      searchParams.append("active", params.active);
    }
    if (params.search) {
      searchParams.append("search", params.search);
    }
    if (params.order_by_participants !== undefined) {
      searchParams.append("order_by_participants", params.order_by_participants.toString());
    }

    const response = await fetch(`${this.baseUrl}/public/event?${searchParams}`);
    return this.handleResponse<PaginatedEventsResponse>(response);
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

  async getEventValidatedTickets(
    id: number,
    minutes?: number
  ): Promise<ValidatedTickets[]> {
    const url = new URL(
      `${this.baseUrl}/private/event/${id}/stats/validated-tickets`
    );
    if (minutes !== undefined) {
      url.searchParams.append("minutes", minutes.toString());
    }

    const response = await this.fetchWithAuth(url.toString());
    return this.handleResponse<ValidatedTickets[]>(response);
  }

  async getEventStaff(
    eventId: number,
    page: number,
    limit: number,
    role?: string,
    search?: string
  ): Promise<PaginatedStaffResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (role) {
      params.append("role", role);
    }
    if (search) {
      params.append("search", search);
    }

    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/${eventId}/staff?${params}`
    );
    return this.handleResponse<PaginatedStaffResponse>(response);
  }

  async getUserEvents(params: GetUserEventsParams): Promise<PaginatedUserEventsResponse> {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    });

    if (params.active) {
      searchParams.append("active", params.active);
    }
    if (params.search) {
      searchParams.append("search", params.search);
    }

    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/user?${searchParams}`
    );
    return this.handleResponse<PaginatedUserEventsResponse>(response);
  }

  async addStaffMember(
    id: number,
    data: AddStaffRequest
  ): Promise<AddStaffResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/${id}/staff`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }
    
    return response.json();
  }

  async updateStaffRole(
    eventId: number,
    userId: number,
    data: UpdateStaffRoleRequest
  ): Promise<UpdateStaffRoleResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/${eventId}/staff/${userId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<UpdateStaffRoleResponse>(response);
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

  async getEventStatsOverview(eventId: number): Promise<EventStatsOverview> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/${eventId}/stats/overview`
    );
    return this.handleResponse<EventStatsOverview>(response);
  }

  async getEventInfo(eventId: number): Promise<EventInfo> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/event/${eventId}/info`
    );
    return this.handleResponse<EventInfo>(response);
  }
}

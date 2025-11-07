import { createFetchWithAuth } from "./fetchWithAuth";

export enum InviteStatus {
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
  PENDING = "Pending",
  PAYMENT_FAILED = "PaymentFailed",
  CREATED = "Created",
  ALL = "All",
  REFUNDED = "Refunded",
}

interface User {
  id: number;
  username: string;
  email: string;
  gender: string;
  phone_number: string;
  instagram_profile: string;
}

interface TicketPricing {
  id: number;
  ticket_type: string;
  gender: string;
  lot: number;
  price: number;
}

interface PaymentDetails {
  authorized_amount: number;
  coupon: string;
}

interface Invite {
  invite_id: number;
  user: User;
  ticket_pricing: TicketPricing;
  payment_details: PaymentDetails;
  is_validated: boolean;
}

interface ResponseJoinRequest {
  invite_id: number;
  approved: boolean;
}

interface RequestUserRequest {
  event_id: number;
  email: string;
  name: string;
  phone_number: string;
  ticket_pricing_id: number;
}

interface GetInvitesResponse {
  invites: Invite[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface ApiResponse {
  message: string;
}

export class InviteGateway {
  private baseUrl: string;
  private fetchWithAuth: ReturnType<typeof createFetchWithAuth>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.fetchWithAuth = createFetchWithAuth(baseUrl);
  }

  private handleError(status: number, endpoint: string): never {
    switch (status) {
      case 400:
        throw new Error("Dados inválidos fornecidos ou parâmetros de paginação inválidos");
      case 401:
        throw new Error("Não autorizado. Faça login novamente");
      case 403:
        throw new Error("Permissões insuficientes para esta operação");
      case 404:
        throw new Error("Convite não encontrado");
      case 500:
        throw new Error("Erro interno do servidor. Tente novamente mais tarde");
      default:
        throw new Error(`Erro inesperado: ${status}`);
    }
  }

  async approveOrRejectJoinRequest(
    request: ResponseJoinRequest
  ): Promise<ApiResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/invite/response-join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      this.handleError(response.status, "response-join");
    }

    return response.json();
  }

  async sendCourtesyTicket(request: RequestUserRequest): Promise<ApiResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/invite/request-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      this.handleError(response.status, "request-user");
    }

    return response.json();
  }

  async getInvitesByEvent(
    eventId: number,
    page: number,
    limit: number,
    status?: InviteStatus,
    search?: string
  ): Promise<GetInvitesResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    const url = `${this.baseUrl}/private/invite/event/${eventId}?${params.toString()}`;

    const response = await this.fetchWithAuth(url);

    if (!response.ok) {
      this.handleError(response.status, "get-event-invites");
    }

    return response.json();
  }

  async getInvitesByUser(userId: number): Promise<GetInvitesResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/invite/user/${userId}`
    );

    if (!response.ok) {
      this.handleError(response.status, "get-user-invites");
    }

    return response.json();
  }
}

import { createFetchWithAuth } from "./fetchWithAuth";

interface CreateTicketPricingRequest {
  event_id: number;
  ticket_type: string;
  gender: string;
  price: number;
}

interface UpdateTicketPricingRequest {
  ticket_type: string;
  gender: string;
  price: number;
  active: boolean;
}

interface AdvanceLotRequest {
  event_id: number;
  ticket_id: number;
  new_price: number;
}

interface TicketPricing {
  id: number;
  event_id: number;
  ticket_type: string;
  gender: string;
  lot: number;
  price: number;
  sold_count: number;
  start_date: string;
  end_date: string;
  active: boolean;
  male_capacity: number;
  female_capacity: number;
  door: boolean;
}

interface AdvanceLotResponse {
  message: string;
  data: TicketPricing;
}

interface DeleteResponse {
  message: string;
}

export class TicketPricingGateway {
  private baseUrl: string;
  private fetchWithAuth: ReturnType<typeof createFetchWithAuth>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.fetchWithAuth = createFetchWithAuth(baseUrl);
  }

  private handleError(status: number, endpoint: string): never {
    const errorMessages: Record<string, Record<number, string>> = {
      create: {
        400: "Dados inválidos ou campos obrigatórios ausentes",
        401: "Não autorizado. Faça login novamente",
        403: "Não autorizado para criar preços de ingresso neste evento",
        409: "Já existe um tipo de ingresso conflitante",
        500: "Erro interno do servidor",
      },
      get: {
        400: "ID inválido",
        404: "Tipo de ingresso não encontrado",
        500: "Erro interno do servidor",
      },
      getByEvent: {
        400: "ID do evento ou parâmetro de status inválido",
        500: "Erro interno do servidor",
      },
      update: {
        400: "ID inválido, dados inválidos ou preço deve ser maior que zero",
        401: "Não autorizado. Faça login novamente",
        403: "Não autorizado para atualizar preços de ingresso neste evento",
        404: "Tipo de ingresso não encontrado",
        409: "Já existe outro tipo de ingresso ativo com mesmo tipo, lote e gênero",
        500: "Erro interno do servidor",
      },
      delete: {
        400: "ID inválido",
        401: "Não autorizado. Faça login novamente",
        403: "Não autorizado para excluir preços de ingresso neste evento",
        404: "Tipo de ingresso não encontrado",
        500: "Erro interno do servidor",
      },
      advanceLot: {
        400: "ID do ingresso inválido, preço deve ser maior que zero, incompatibilidade de evento ou não é possível avançar ingresso inativo",
        401: "Não autorizado. Faça login novamente",
        403: "Não autorizado para avançar lotes neste evento",
        404: "Tipo de ingresso não encontrado",
        500: "Erro interno do servidor",
      },
    };

    const message =
      errorMessages[endpoint]?.[status] || `Erro inesperado: ${status}`;
    throw new Error(message);
  }

  async createTicketPricing(
    request: CreateTicketPricingRequest
  ): Promise<TicketPricing> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/ticketpricing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      this.handleError(response.status, "create");
    }

    return response.json();
  }

  async getTicketPricing(id: number): Promise<TicketPricing> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/ticketpricing/${id}`
    );

    if (!response.ok) {
      this.handleError(response.status, "get");
    }

    return response.json();
  }

  async getTicketPricingByEvent(
    eventId: number,
    status?: "Active" | "Inactive" | "All"
  ): Promise<TicketPricing[]> {
    const params = new URLSearchParams();
    if (status) {
      params.append("status", status);
    }

    const url = `${this.baseUrl}/private/ticketpricing/event/${eventId}${
      params.toString() ? `?${params}` : ""
    }`;
    const response = await this.fetchWithAuth(url);

    if (!response.ok) {
      this.handleError(response.status, "getByEvent");
    }

    return response.json();
  }

  async updateTicketPricing(
    id: number,
    request: UpdateTicketPricingRequest
  ): Promise<TicketPricing> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/ticketpricing/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      this.handleError(response.status, "update");
    }

    return response.json();
  }

  async deleteTicketPricing(id: number): Promise<DeleteResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/ticketpricing/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      this.handleError(response.status, "delete");
    }

    return response.json();
  }

  async advanceLot(request: AdvanceLotRequest): Promise<AdvanceLotResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/ticketpricing/advance-lot`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      this.handleError(response.status, "advanceLot");
    }

    return response.json();
  }
}

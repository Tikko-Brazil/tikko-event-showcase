import { createFetchWithAuth } from "./fetchWithAuth";

interface RefundRequest {
  amount?: number;
  user_id: number;
  event_id: number;
}

interface ApiResponse {
  message: string;
}

export class PaymentGateway {
  private baseUrl: string;
  private fetchWithAuth: ReturnType<typeof createFetchWithAuth>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.fetchWithAuth = createFetchWithAuth(baseUrl);
  }

  private handleError(status: number): never {
    switch (status) {
      case 400:
        throw new Error("Formato de solicitação inválido");
      case 401:
        throw new Error("Não autorizado. Faça login novamente");
      case 403:
        throw new Error("Permissões insuficientes para processar estorno");
      case 500:
        throw new Error(
          "Falha ao processar estorno. Tente novamente mais tarde"
        );
      default:
        throw new Error(`Erro inesperado: ${status}`);
    }
  }

  async processRefund(request: RefundRequest): Promise<ApiResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/payment/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      this.handleError(response.status);
    }

    return response.json();
  }
}

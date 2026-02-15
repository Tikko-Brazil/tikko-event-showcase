import { createFetchWithAuth } from "./fetchWithAuth";

interface RefundRequest {
  amount?: number;
  user_id: number;
  event_id: number;
}

interface ApiResponse {
  message: string;
}

interface PaymentStatusResponse {
  paid: boolean;
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
      case 404:
        throw new Error("Pagamento não encontrado");
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

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    const response = await fetch(
      `${this.baseUrl}/public/payment/${paymentId}/status`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      this.handleError(response.status);
    }

    return response.json();
  }
}

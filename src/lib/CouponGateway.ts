import { createFetchWithAuth } from "./fetchWithAuth";
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
  LockedException,
  InternalServerErrorException,
} from "./exceptions";

interface CouponPriceRequest {
  event_id: string;
  ticket_pricing_id: string;
  coupon: string;
}

interface CouponPriceResponse {
  original_price: number;
  final_price: number;
  discount_applied: number;
}

interface CreateCouponRequest {
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number;
  valid_from?: string;
  valid_until?: string;
  event_id: number;
  ticket_pricing_id: number[];
}

interface UpdateCouponRequest {
  max_uses: number;
  active: boolean;
  ticket_pricing_ids: number[];
}

interface TicketPricing {
  id: number;
  ticket_type: string;
  price: number;
  lot: number;
  gender: string;
}

interface Coupon {
  id: number;
  event_id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number;
  used_count: number;
  validated_count: number;
  total_authorized_amount: number;
  valid_from: string;
  valid_until: string;
  created_at: string;
  created_by: number;
  active: boolean;
  ticket_pricings: TicketPricing[];
}

interface CouponsListResponse {
  coupons: Coupon[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface DeleteCouponResponse {
  message: string;
}

const ERROR_MESSAGES = {
  getCouponPrice: {
    400: "Invalid event ID or ticket type ID",
    403: "Coupon no longer valid",
    404: "Coupon not found",
    422: "Coupon inactive",
    423: "Coupon invalid for this ticket type",
    500: "Server error during coupon validation",
  },
  createCoupon: {
    400: "Invalid request data",
    401: "Authentication required",
    403: "Insufficient permissions",
    500: "Server error during coupon creation",
  },
  getCoupon: {
    400: "Invalid coupon ID",
    401: "Authentication required",
    403: "Insufficient permissions",
    404: "Coupon not found",
    500: "Server error",
  },
  updateCoupon: {
    400: "Invalid coupon ID or request data",
    401: "Authentication required",
    403: "Insufficient permissions",
    404: "Coupon not found",
    500: "Server error during coupon update",
  },
  deleteCoupon: {
    400: "Invalid coupon ID",
    401: "Authentication required",
    403: "Insufficient permissions",
    404: "Coupon not found",
    500: "Server error during coupon deletion",
  },
  getEventCoupons: {
    400: "Invalid event ID or ticket pricing ID",
    401: "Authentication required",
    403: "Insufficient permissions",
    500: "Server error",
  },
};

export class CouponGateway {
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

    if (
      response.status === 200 ||
      response.status === 201 ||
      response.status === 204
    ) {
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
      case 422:
        throw new UnprocessableEntityException(message);
      case 423:
        throw new LockedException(message);
      case 500:
        throw new InternalServerErrorException(message);
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  }

  // Public endpoint
  async getCouponPrice(data: CouponPriceRequest): Promise<CouponPriceResponse> {
    const response = await fetch(`${this.baseUrl}/public/coupon/price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<CouponPriceResponse>(response, "getCouponPrice");
  }

  // Private endpoints
  async createCoupon(data: CreateCouponRequest): Promise<Coupon> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/coupon`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<Coupon>(response, "createCoupon");
  }

  async getCoupon(id: number): Promise<Coupon> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/coupon/${id}`
    );
    return this.handleResponse<Coupon>(response, "getCoupon");
  }

  async updateCoupon(id: number, data: UpdateCouponRequest): Promise<Coupon> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/coupon/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<Coupon>(response, "updateCoupon");
  }

  async deleteCoupon(id: number): Promise<DeleteCouponResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/private/coupon/${id}`,
      {
        method: "DELETE",
      }
    );
    return this.handleResponse<DeleteCouponResponse>(response, "deleteCoupon");
  }

  async getEventCoupons(
    eventId: number,
    page: number,
    limit: number,
    ticketPricingId?: number,
    status?: string,
    search?: string
  ): Promise<CouponsListResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (ticketPricingId) {
      params.append("ticket_pricing_id", ticketPricingId.toString());
    }
    if (status) {
      params.append("status", status);
    }
    if (search) {
      params.append("search", search);
    }

    const url = `${this.baseUrl}/private/coupons/event/${eventId}?${params}`;
    const response = await this.fetchWithAuth(url);
    return this.handleResponse<CouponsListResponse>(
      response,
      "getEventCoupons"
    );
  }
}

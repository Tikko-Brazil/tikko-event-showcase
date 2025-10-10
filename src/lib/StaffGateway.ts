import { createFetchWithAuth } from "./fetchWithAuth";

export enum StaffRole {
  HOST = "host",
  MANAGER = "manager",
  COORDINATOR = "coordinator",
  VALIDATOR = "validator",
}

export interface StaffMember {
  id: string;
  user_id: string;
  event_id: number;
  role: StaffRole;
  created_at: string;
  user: {
    id: string;
    username: string;
    email: string;
    instagram_profile?: string;
  };
}

export interface CreateStaffMemberRequest {
  user_email: string;
  event_id: number;
  role: StaffRole;
}

export interface UpdateStaffMemberRequest {
  staff_id: string;
  role: StaffRole;
}

export class StaffGateway {
  private baseUrl: string;
  private fetchWithAuth: ReturnType<typeof createFetchWithAuth>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.fetchWithAuth = createFetchWithAuth(baseUrl);
  }

  async getEventStaff(
    eventId: number,
    role?: StaffRole,
    searchTerm?: string
  ): Promise<{ staff: StaffMember[] }> {
    const params = new URLSearchParams();
    if (role) params.append("role", role);
    if (searchTerm) params.append("search", searchTerm);

    const url = `${this.baseUrl}/events/${eventId}/staff${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await this.fetchWithAuth(url);

    if (!response.ok) {
      throw new Error("Failed to fetch event staff");
    }

    return response.json();
  }

  async addStaffMember(data: CreateStaffMemberRequest): Promise<StaffMember> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/events/${data.event_id}/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_email: data.user_email,
        role: data.role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add staff member");
    }

    return response.json();
  }

  async updateStaffMember(data: UpdateStaffMemberRequest): Promise<StaffMember> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/staff/${data.staff_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: data.role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update staff member");
    }

    return response.json();
  }

  async removeStaffMember(staffId: string): Promise<void> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/staff/${staffId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to remove staff member");
    }
  }
}

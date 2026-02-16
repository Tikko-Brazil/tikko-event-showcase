import { useQuery, useMutation } from "@tanstack/react-query";
import { apiAuth } from "../client";

export interface EventStaffMember {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  birthday: string;
  gender: string;
  location: string;
  instagram_profile: string;
  role: string | number;
}

export interface GetEventStaffResponse {
  staff: EventStaffMember[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetEventStaffParams {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AddStaffInput {
  email: string;
  role: string;
}

export interface AddStaffResponse {
  message: string;
}

export interface UpdateStaffRoleInput {
  role: string;
}

export interface UpdateStaffRoleResponse {
  message: string;
}

export const useGetEventStaff = (
  eventId: number,
  params: GetEventStaffParams = {}
) => {
  const { role = "all", search = "", page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ["event-staff", eventId, role, search, page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        role,
        search,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiAuth.get(
        `/private/event/${eventId}/staff?${queryParams}`
      );
      return response.data as GetEventStaffResponse;
    },
  });
};

export const useUpdateStaffRole = (eventId: number, userId: number) => {
  return useMutation({
    mutationFn: async (input: UpdateStaffRoleInput) => {
      const response = await apiAuth.put(
        `/private/event/${eventId}/staff/${userId}`,
        input
      );
      return response.data as UpdateStaffRoleResponse;
    },
  });
};

export const useAddEventStaff = (eventId: number) => {
  return useMutation({
    mutationFn: async (input: AddStaffInput) => {
      const response = await apiAuth.post(
        `/private/event/${eventId}/staff`,
        input
      );
      return response.data as AddStaffResponse;
    },
  });
};

export interface RemoveStaffResponse {
  message: string;
}

export const useRemoveEventStaff = (eventId: number) => {
  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiAuth.delete(
        `/private/event/${eventId}/staff/${userId}`
      );
      return response.data as RemoveStaffResponse;
    },
  });
};

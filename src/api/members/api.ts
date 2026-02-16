import { useQuery, useMutation } from "@tanstack/react-query";
import { apiAuth } from "../client";

export interface OrganizationMember {
  id: number;
  email: string;
  username: string;
  gender: string;
  birthday: string;
  phone_number: string;
  location: string;
  bio: string;
  instagram_profile: string;
  role: number;
  is_first_access: boolean;
  organization_role: number;
}

export interface GetOrganizationMembersResponse {
  members: OrganizationMember[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetOrganizationMembersParams {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AddOrganizationMemberInput {
  email: string;
  role: number;
}

export interface AddOrganizationMemberResponse {
  message: string;
}

export interface UpdateMemberRoleInput {
  role: number;
}

export interface UpdateMemberRoleResponse {
  message: string;
}

export interface RemoveMemberResponse {
  message: string;
}

export const useGetOrganizationMembers = (
  organizationId: number,
  params: GetOrganizationMembersParams = {}
) => {
  const { role = "all", search = "", page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ["organization-members", organizationId, role, search, page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        role,
        search,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiAuth.get(
        `/private/organization/${organizationId}/members?${queryParams}`
      );
      return response.data as GetOrganizationMembersResponse;
    },
  });
};

export const useAddOrganizationMember = (organizationId: number) => {
  return useMutation({
    mutationFn: async (input: AddOrganizationMemberInput) => {
      const response = await apiAuth.post(
        `/private/organization/${organizationId}/members`,
        input
      );
      return response.data as AddOrganizationMemberResponse;
    },
  });
};

export const useUpdateMemberRole = (organizationId: number, userId: number) => {
  return useMutation({
    mutationFn: async (input: UpdateMemberRoleInput) => {
      const response = await apiAuth.put(
        `/private/organization/${organizationId}/members/${userId}`,
        input
      );
      return response.data as UpdateMemberRoleResponse;
    },
  });
};

export const useRemoveOrganizationMember = (organizationId: number, userId: number) => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiAuth.delete(
        `/private/organization/${organizationId}/members/${userId}`
      );
      return response.data as RemoveMemberResponse;
    },
  });
};

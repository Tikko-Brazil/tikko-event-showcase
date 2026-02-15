import { useParams } from "react-router-dom";
import { useGetOrganization } from "@/api/organization/api";
import { OrganizationEditForm } from "@/components/OrganizationEditForm";
import { useQueryClient } from "@tanstack/react-query";

export default function OrganizationEditPage() {
  const { organizationId } = useParams();
  const queryClient = useQueryClient();
  const { data: organization } = useGetOrganization(Number(organizationId));

  if (!organization) return null;

  return (
    <OrganizationEditForm 
      organization={organization}
      onSuccess={() => {
        queryClient.invalidateQueries({ queryKey: ["organization", Number(organizationId)] });
      }}
    />
  );
}

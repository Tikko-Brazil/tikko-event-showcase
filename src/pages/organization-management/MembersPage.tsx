import { useParams } from "react-router-dom";
import { OrganizationMembers } from "@/components/OrganizationMembers";

export default function MembersPage() {
  const { organizationId } = useParams();
  return <OrganizationMembers organizationId={parseInt(organizationId!)} />;
}

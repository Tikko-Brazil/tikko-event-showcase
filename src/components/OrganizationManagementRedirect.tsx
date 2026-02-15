import { Navigate, useParams } from "react-router-dom";

export default function OrganizationManagementRedirect() {
  const { organizationId } = useParams();
  
  // Always redirect to edit - mobile layout will handle showing menu instead
  return <Navigate to={`/organization-management/${organizationId}/edit`} replace />;
}

import { useParams } from "react-router-dom";
import { OrganizationPaymentSection } from "@/components/OrganizationPaymentSection";

export default function PaymentPage() {
  const { organizationId } = useParams();

  return <OrganizationPaymentSection organizationId={Number(organizationId)} />;
}

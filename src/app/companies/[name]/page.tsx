import { VAULT } from "@/components/dashboard/data";
import CompanyFullPage from "./CompanyFullPage";

export function generateStaticParams() {
  return VAULT.map((v) => ({ name: v.name.toLowerCase() }));
}

export default function CompanyPage({ params }: { params: { name: string } }) {
  const company = VAULT.find((v) => v.name.toLowerCase() === decodeURIComponent(params.name));
  return <CompanyFullPage company={company ?? null} />;
}

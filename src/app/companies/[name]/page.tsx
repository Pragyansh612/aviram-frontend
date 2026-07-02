import { VAULT } from "@/components/dashboard/data";
import CompanyFullPage from "./CompanyFullPage";

export function generateStaticParams() {
  return VAULT.map((v) => ({ name: v.name.toLowerCase() }));
}

export default async function CompanyPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const company = VAULT.find((v) => v.name.toLowerCase() === decodeURIComponent(name));
  return <CompanyFullPage company={company ?? null} />;
}

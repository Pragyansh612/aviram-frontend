import { OPPS } from "@/components/dashboard/data";
import OpportunityFullPage from "./OpportunityFullPage";

export function generateStaticParams() {
  return OPPS.map((o) => ({ id: o.id }));
}

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opp = OPPS.find((o) => o.id === id);
  return <OpportunityFullPage opp={opp ?? null} />;
}

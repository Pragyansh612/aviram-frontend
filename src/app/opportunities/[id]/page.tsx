import { OPPS } from "@/components/dashboard/data";
import OpportunityFullPage from "./OpportunityFullPage";

export function generateStaticParams() {
  return OPPS.map((o) => ({ id: o.id }));
}

export default function OpportunityPage({ params }: { params: { id: string } }) {
  const opp = OPPS.find((o) => o.id === params.id);
  return <OpportunityFullPage opp={opp ?? null} />;
}

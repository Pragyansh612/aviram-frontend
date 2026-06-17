import { OUTREACH } from "@/components/dashboard/data";
import OutreachFullPage from "./OutreachFullPage";

export function generateStaticParams() {
  return OUTREACH.campaigns.map((c) => ({ id: c.id }));
}

export default function OutreachPage({ params }: { params: { id: string } }) {
  const campaign = OUTREACH.campaigns.find((c) => c.id === params.id);
  return <OutreachFullPage campaign={campaign ?? null} />;
}

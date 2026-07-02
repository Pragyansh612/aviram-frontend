import { OUTREACH } from "@/components/dashboard/data";
import OutreachFullPage from "./OutreachFullPage";

export function generateStaticParams() {
  return OUTREACH.campaigns.map((c) => ({ id: c.id }));
}

export default async function OutreachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = OUTREACH.campaigns.find((c) => c.id === id);
  return <OutreachFullPage campaign={campaign ?? null} />;
}

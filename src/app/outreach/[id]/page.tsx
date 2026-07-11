import OutreachFullPage from "./OutreachFullPage";

export default async function OutreachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OutreachFullPage campaignId={id} />;
}

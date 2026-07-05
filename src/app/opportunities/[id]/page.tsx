import OpportunityFullPage from "./OpportunityFullPage";

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OpportunityFullPage jobId={id} />;
}

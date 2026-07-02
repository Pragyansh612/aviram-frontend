import ApplicationFullPage from "./ApplicationFullPage";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationFullPage appId={id} />;
}

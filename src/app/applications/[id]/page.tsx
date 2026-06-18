import ApplicationFullPage from "./ApplicationFullPage";

export default function ApplicationPage({ params }: { params: { id: string } }) {
  return <ApplicationFullPage appId={params.id} />;
}

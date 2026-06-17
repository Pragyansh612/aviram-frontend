import { APPS } from "@/components/dashboard/data";
import ApplicationFullPage from "./ApplicationFullPage";

export function generateStaticParams() {
  return APPS.map((a) => ({ id: a.id }));
}

export default function ApplicationPage({ params }: { params: { id: string } }) {
  const app = APPS.find((a) => a.id === params.id);
  return <ApplicationFullPage app={app ?? null} />;
}

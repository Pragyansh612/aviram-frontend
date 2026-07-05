import CompanyFullPage from "./CompanyFullPage";

export default async function CompanyPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <CompanyFullPage companyName={decodeURIComponent(name)} />;
}

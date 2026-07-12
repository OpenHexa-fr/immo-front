import { SearchResults } from "@/components/SearchResults";
import { searchDVF } from "@/lib/api";

interface RecherchePageProps {
  searchParams: { commune?: string; code_postal?: string };
}

export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const results = await searchDVF({
    commune: searchParams.commune,
    code_postal: searchParams.code_postal,
    size: 20,
  });

  return <SearchResults items={results.items} total={results.total} />;
}

import { Suspense } from "react";

import { CarteExplorer } from "@/components/carte/CarteExplorer";

export default function CartePage() {
  return (
    <Suspense fallback={null}>
      <CarteExplorer />
    </Suspense>
  );
}

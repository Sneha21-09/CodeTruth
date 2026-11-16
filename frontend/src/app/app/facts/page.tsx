import { Suspense } from "react";
import { FactsPage } from "@/components/app/FactsPage";
import { Spinner } from "@/components/ui/States";

export const metadata = { title: "Product Facts" };
export default function Page() { return <Suspense fallback={<Spinner />}><FactsPage /></Suspense>; }

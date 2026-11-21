import { Suspense } from "react";
import { ReviewsList } from "@/components/app/ReviewsList";
import { Spinner } from "@/components/ui/States";

export const metadata = { title: "Content Reviews" };
export default function Page() { return <Suspense fallback={<Spinner />}><ReviewsList /></Suspense>; }

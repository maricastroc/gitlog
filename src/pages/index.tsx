import { Suspense } from "react";
import DashboardClient from "@/dashboard/DashboardClient";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-[#666] text-sm">
          carregando...
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}

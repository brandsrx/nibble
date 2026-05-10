"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ConnectionHub } from "@/components/connection/ConnectionHub";

function JoinContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  return <ConnectionHub initialCode={code ?? undefined} />;
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinContent />
    </Suspense>
  );
}

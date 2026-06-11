"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CPAGripPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let tid = localStorage.getItem("ow_visitor");
    if (!tid) {
      fetch("/api/offerwall/register", { method: "POST" })
        .then(r => r.json())
        .then((d: { visitorId: string }) => {
          localStorage.setItem("ow_visitor", d.visitorId);
          tid = d.visitorId;
          setTrackingId(tid);
          setReady(true);
        });
    } else {
      setTrackingId(tid);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || !trackingId) return;

    // Inject CPAgrip scripts directly into document head
    const s1 = document.createElement("script");
    s1.textContent = "var lck = false;";
    document.head.appendChild(s1);

    const s2 = document.createElement("script");
    s2.src = `https://doctoredits.com/script_include.php?id=1899809&tracking_id=${trackingId}`;
    s2.async = true;
    document.head.appendChild(s2);

    const s3 = document.createElement("script");
    s3.textContent = `if(!lck){top.location = 'https://doctoredits.com/help/ablk.php?lkt=4'; }`;
    document.head.appendChild(s3);
  }, [ready, trackingId]);

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-8 text-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
      <h1 className="text-xl font-bold text-text mb-2">Loading Offers...</h1>
      <p className="text-text-muted text-sm mb-6">Please wait while the offerwall loads. Complete any offer to earn MT points.</p>
      <button onClick={() => router.push("/")} className="text-sm text-primary hover:underline cursor-pointer" type="button">
        &larr; Back to Money Tricks
      </button>
    </div>
  );
}

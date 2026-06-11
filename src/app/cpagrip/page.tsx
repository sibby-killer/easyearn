"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

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
          setTrackingId(d.visitorId);
          setReady(true);
        });
    } else {
      setTrackingId(tid);
      setReady(true);
    }
  }, []);

  return (
    <>
      {ready && trackingId && (
        <Script id="cpagrip-lck" strategy="beforeInteractive">
          {`var lck = false;`}
        </Script>
      )}
      {ready && trackingId && (
        <Script
          src={`https://doctoredits.com/script_include.php?id=1899809&tracking_id=${trackingId}`}
          strategy="beforeInteractive"
        />
      )}
      {ready && trackingId && (
        <Script id="cpagrip-redirect" strategy="beforeInteractive">
          {`if(!lck){top.location = 'https://doctoredits.com/help/ablk.php?lkt=4'; }`}
        </Script>
      )}

      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
        <h1 className="text-xl font-bold text-text mb-2">Loading CPAgrip Offers...</h1>
        <p className="text-text-muted text-sm mb-6">Please wait while we load the offerwall. Complete any offer to earn MT points.</p>
        <button onClick={() => router.push("/")} className="text-sm text-primary hover:underline cursor-pointer" type="button">
          &larr; Back to Money Tricks
        </button>
      </div>
    </>
  );
}

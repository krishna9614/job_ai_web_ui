"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="dash">
      <div className="dash-main">
        <div className="container">
          <div className="card empty-card">
            <h2>
              Something went <span className="hl">wrong</span>
            </h2>
            <p className="sub">We couldn’t display your dashboard. Please try again.</p>
            <Button onClick={reset}>
              <RefreshCw className="ic ic-sm" />
              Try again
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

/** Loading placeholder that mirrors the dashboard layout to avoid layout shift. */
export function DashboardSkeleton() {
  return (
    <div className="dash-grid" aria-busy="true" aria-label="Loading your profile">
      <aside className="dash-side">
        <div className="card p-card">
          <div className="skel" style={{ width: 84, height: 84, borderRadius: "50%", margin: "0 auto 16px" }} />
          <div className="skel" style={{ width: "60%", height: 22, margin: "0 auto 10px" }} />
          <div className="skel" style={{ width: "75%", height: 14, margin: "0 auto 8px" }} />
          <div className="skel" style={{ width: "45%", height: 14, margin: "0 auto 20px" }} />
          <div className="skel" style={{ width: "100%", height: 60, borderRadius: 999 }} />
        </div>
        <div className="card acct-card">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skel" style={{ height: 14, margin: "12px 0" }} />
          ))}
        </div>
      </aside>
      <div className="dash-sections">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card sec-card">
            <div className="skel" style={{ width: 220, height: 20, marginBottom: 22 }} />
            <div className="info-grid">
              {[0, 1, 2, 3].map((j) => (
                <div key={j}>
                  <div className="skel" style={{ width: 90, height: 12, marginBottom: 8 }} />
                  <div className="skel" style={{ width: "70%", height: 16 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

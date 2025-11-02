"use client";
import { useState } from "react";

export default function Page() {
  const [localISO, setLocalISO] = useState("2024-02-01T00:00:00");
  const [tzid, setTzid] = useState("Asia/Seoul");
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setOut(null);
    try {
      const r = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localISO, tzid }),
      });
      const j = await r.json();
      setOut(j);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "40px auto",
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Bazi Calc — SwissEph smoke
      </h1>

      <label>localISO</label>
      <input
        value={localISO}
        onChange={(e) => setLocalISO(e.target.value)}
        style={{
          width: "100%",
          padding: 8,
          margin: "6px 0 12px 0",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      />

      <label>tzid</label>
      <input
        value={tzid}
        onChange={(e) => setTzid(e.target.value)}
        style={{
          width: "100%",
          padding: 8,
          margin: "6px 0 12px 0",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      />

      <button
        onClick={run}
        disabled={loading}
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #222",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        {loading ? "계산 중..." : "계산하기"}
      </button>

      {out && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>결과</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f7f7f7",
              padding: 12,
              borderRadius: 8,
            }}
          >
            {JSON.stringify(out, null, 2)}
          </pre>
          {out?.meta?.preview && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>
                swetest preview
              </h3>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  background: "#f0f0f0",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                {out.meta.preview}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

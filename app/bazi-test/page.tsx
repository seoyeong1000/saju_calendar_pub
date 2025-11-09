"use client";
import { useState } from "react";

export default function Page() {
  const [localISO, setLocalISO] = useState("2024-02-01T00:00:00");
  const [tzid, setTzid] = useState("Asia/Seoul");
  const [lon, setLon] = useState<number | "">(""); // 경도(°E, 서경은 음수)
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setOut(null);
    try {
      const body: any = { localISO, tzid };
      if (lon !== "") body.lon = Number(lon);

      const r = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      setOut(j);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Bazi Calc — SwissEph smoke</h1>

      <label className="block">
        <div className="mb-1">localISO</div>
        <input className="w-full border rounded px-3 py-2"
          value={localISO} onChange={e=>setLocalISO(e.target.value)} />
      </label>

      <label className="block">
        <div className="mb-1">tzid</div>
        <input className="w-full border rounded px-3 py-2"
          value={tzid} onChange={e=>setTzid(e.target.value)} />
      </label>

      <label className="block">
        <div className="mb-1">경도 lon (동경=양수, 예: 서울 126.9784)</div>
        <input className="w-full border rounded px-3 py-2"
          placeholder="126.9784"
          value={lon} onChange={e=>setLon(e.target.value as any)} />
      </label>

      <button
        onClick={run}
        disabled={loading}
        className="px-4 py-2 border rounded"
      >
        {loading ? "계산 중..." : "계산하기"}
      </button>

      <h2 className="text-2xl font-bold">결과</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(out, null, 2)}
      </pre>
    </main>
  );
}

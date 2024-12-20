"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { useState, useEffect } from "react";

interface District {
  Avtalekontor: string;
  OmradeKode: string;
  [key: string]: any;
}

interface Taxi {
  copies: number;
  contractId: string;
  [key: string]: any;
}

interface Data {
  districts?: District[];
  taxis?: Taxi[];
}

export default function AnalyzePage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/get-resources");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-32">
          Laster...
        </div>
      </PageContainer>
    );
  }

  const districtCount = data?.districts?.length ?? 0;
  const avgKmpris = data?.districts
    ? data.districts.reduce((sum: number, d: any) => sum + (d.Kmpris || 0), 0) / districtCount
    : 0;

  // Aggregate copies per OmradeKode
  const copiesByOmradeKode: Record<string, number> = {};
  if (data?.districts && data?.taxis) {
    // For simplicity, assume all taxis apply to all districts equally. In a real scenario, you'd link them properly.
    // Here we just sum all taxis copies and divide equally (or show total) per district OmradeKode.
    // Let's just sum all taxis copies and group by OmradeKode:
    const totalCopies = data.taxis.reduce((acc, t) => acc + (t.copies || 0), 0);

    // Distribute totalCopies evenly among districts if needed, or just show total per OmradeKode.
    // Since we have no direct linkage, we'll just show total copies per OmradeKode by summation of all taxis.
    // A more complex logic would require a relation between districts and taxis.

    for (const dist of data.districts) {
      copiesByOmradeKode[dist.OmradeKode] = totalCopies;
    }
  }

  // Aggregate copies per Avtalekontor
  const copiesByAvtalekontor: Record<string, number> = {};
  if (data?.districts && data?.taxis) {
    const totalCopies = data.taxis.reduce((acc, t) => acc + (t.copies || 0), 0);
    for (const dist of data.districts) {
      copiesByAvtalekontor[dist.Avtalekontor] = totalCopies;
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Avtaleanalyse"
        description="Oversikt og analyse av avtaledata"
      />

      <div className="grid gap-6">
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Antall distrikter</h3>
            <p className="text-2xl font-bold">{districtCount}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Gjennomsnittlig km-pris</h3>
            <p className="text-2xl font-bold">{avgKmpris.toFixed(2)} kr</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Kopier pr Områdekode</h3>
            <ul className="text-sm space-y-1">
              {Object.keys(copiesByOmradeKode).map((ok) => (
                <li key={ok}>
                  <span className="font-bold">{ok}:</span> {copiesByOmradeKode[ok]} kopier
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Kopier pr Avtalekontor</h3>
            <ul className="text-sm space-y-1">
              {Object.keys(copiesByAvtalekontor).map((ak) => (
                <li key={ak}>
                  <span className="font-bold">{ak}:</span> {copiesByAvtalekontor[ak]} kopier
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium mb-2">Rådata</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </PageContainer>
  );
}
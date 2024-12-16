"use client";

import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function PortalPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)

  async function handleUpload() {
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/parse", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    setResult(data)
  }

  return (
    <PageContainer>
      <PageHeader
        title="CSV Parsing Portal"
        description="Upload and parse CSV files containing contract data"
      />

      <div className="grid gap-6">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={handleUpload}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Parse CSV
          </button>
        </div>

        {result && (
          <pre className="rounded-lg bg-muted p-4 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </PageContainer>
  )
}
"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function EditorPage() {
  const [data, setData] = useState<any>(null);
  const [districtIndex, setDistrictIndex] = useState(0);
  const [editedFields, setEditedFields] = useState<any>({});

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/get-resources");
      const json = await res.json();
      setData(json);
    })();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, field: string) {
    setEditedFields({ ...editedFields, [field]: e.target.value });
  }

  async function handleSave() {
    if (!data) return;
    const newData = { ...data };
    Object.keys(editedFields).forEach((key) => {
      newData.districts[districtIndex][key] = editedFields[key];
    });

    const res = await fetch("/api/save-resources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newData)
    });
    const updated = await res.json();
    setData(updated);
    setEditedFields({});
  }

  if (!data) return (
    <PageContainer>
      <div className="flex items-center justify-center h-32">
        Laster...
      </div>
    </PageContainer>
  );

  const district = data.districts[districtIndex] || {};

  return (
    <PageContainer>
      <PageHeader
        title="Editor"
        description="Rediger felter for valgt distrikt"
      />

      <div className="flex items-center gap-4 mb-4">
        <label className="block">
          Velg Distrikt:
          <select
            className="ml-2 border h-9 px-2 rounded"
            value={districtIndex}
            onChange={(e) => setDistrictIndex(parseInt(e.target.value))}
          >
            {data.districts.map((_: any, i: number) => (
              <option key={i} value={i}>
                Distrikt {i + 1}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.keys(district).map((field) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="font-semibold">{field}</label>
            <input
              type="text"
              value={editedFields[field] ?? district[field]}
              onChange={(e) => handleChange(e, field)}
              className="border p-1 rounded"
            />
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        className="mt-4"
      >
        Lagre
      </Button>
    </PageContainer>
  );
}
import { NextRequest, NextResponse } from "next/server";
import { parseCSV } from "@/lib/csv-utils";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const parsedData = await parseCSV(buffer.toString());

  // In a real scenario, you might merge this data into resources.json
  const jsonPath = path.join(process.cwd(), "raw", "resources.json");
  const raw = await fs.readFile(jsonPath, "utf-8");
  const json = JSON.parse(raw);

  // Example: Append parsedData under a new "parsed" key
  json.parsed = parsedData;

  await fs.writeFile(jsonPath, JSON.stringify(json, null, 2));

  return NextResponse.json(json);
}
"use server";
import { parseCSV } from "@/lib/csv-utils";
import { promises as fs } from "fs";
import path from "path";

export async function parseAndUpdateResources(csvContent: string) {
  const parsedData = await parseCSV(csvContent);
  const jsonPath = path.join(process.cwd(), "raw", "resources.json");
  const raw = await fs.readFile(jsonPath, "utf-8");
  const json = JSON.parse(raw);
  json.parsed = parsedData;
  await fs.writeFile(jsonPath, JSON.stringify(json, null, 2));
  return json;
}
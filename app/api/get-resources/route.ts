import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const jsonPath = path.join(process.cwd(), "raw", "resources.json");
  const raw = await fs.readFile(jsonPath, "utf-8");
  const json = JSON.parse(raw);
  return NextResponse.json(json);
}
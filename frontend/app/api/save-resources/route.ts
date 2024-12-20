import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const jsonPath = path.join(process.cwd(), "raw", "resources.json");
  await fs.writeFile(jsonPath, JSON.stringify(body, null, 2));
  return NextResponse.json(body);
}
export async function parseCSV(csvContent: string) {
  // Simple CSV parser (for demonstration)
  const lines = csvContent.trim().split("\n");
  const headers = lines[0].split(",");
  const data = lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.trim();
    });
    return obj;
  });
  return data;
}
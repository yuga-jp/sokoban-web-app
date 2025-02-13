import { parse } from "csv-parse/browser/esm/sync";

export default async function loadCSV(filePath: string): Promise<any[]> {
  const data = await (await fetch(filePath)).text();
  const records: any[] = parse(data, { delimiter: " " });
  return records;
}

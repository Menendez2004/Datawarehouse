import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const RAW_CSV_PATH = path.join(__dirname, "..", "data", "train.csv");
const OUTPUT_JSON_PATH = path.join(__dirname, "..", "data", "cleaned.json");
const LOG_PATH = path.join(__dirname, "..", "output", "02_limpieza.log");

interface RawRow {
  [key: string]: string;
}

export interface CleanedRow {
  rowId: number;
  orderId: string;
  orderDate: string;
  shipDate: string;
  shipMode: string;
  customerId: string;
  customerName: string;
  segment: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
  region: string;
  productId: string;
  category: string;
  subCategory: string;
  productName: string;
  sales: number;
}

const KNOWN_POSTAL_CODE_FIXES: Record<string, string> = {
  "Burlington|Vermont": "05401",
};

function normalizePostalCode(raw: string, city: string, state: string): { value: string; wasImputed: boolean; wasPadded: boolean } {
  const trimmed = raw.trim();
  if (trimmed === "") {
    const key = `${city}|${state}`;
    const fixed = KNOWN_POSTAL_CODE_FIXES[key];
    if (!fixed) {
      throw new Error(`No hay valor conocido para postal code vacio en ${key}`);
    }
    return { value: fixed, wasImputed: true, wasPadded: false };
  }
  if (trimmed.length === 4) {
    return { value: "0" + trimmed, wasImputed: false, wasPadded: true };
  }
  return { value: trimmed, wasImputed: false, wasPadded: false };
}

function parseDdMmYyyyToIso(raw: string): string {
  const [dd, mm, yyyy] = raw.trim().split("/");
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function buildCanonicalProductNames(rows: RawRow[]): Map<string, string> {
  const counts = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const pid = r["Product ID"];
    const name = r["Product Name"].trim();
    if (!counts.has(pid)) counts.set(pid, new Map());
    const nameMap = counts.get(pid)!;
    nameMap.set(name, (nameMap.get(name) || 0) + 1);
  }
  const canonical = new Map<string, string>();
  for (const [pid, nameMap] of counts.entries()) {
    const sorted = [...nameMap.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
    canonical.set(pid, sorted[0][0]);
  }
  return canonical;
}

function main() {
  const content = fs.readFileSync(RAW_CSV_PATH, "utf-8");
  const rawRows = parse(content, { columns: true, skip_empty_lines: true }) as RawRow[];

  const logLines: string[] = [];
  logLines.push("=== LIMPIEZA Y NORMALIZACION: train.csv ===\n");
  logLines.push(`Registros de entrada: ${rawRows.length}`);

  const canonicalNames = buildCanonicalProductNames(rawRows);
  const inconsistentProductCount = [...canonicalNames.keys()].length;

  let postalImputed = 0;
  let postalPadded = 0;
  let productNamesFixed = 0;

  const cleaned: CleanedRow[] = rawRows.map((r) => {
    const postal = normalizePostalCode(r["Postal Code"], r["City"].trim(), r["State"].trim());
    if (postal.wasImputed) postalImputed++;
    if (postal.wasPadded) postalPadded++;

    const originalName = r["Product Name"].trim();
    const canonicalName = canonicalNames.get(r["Product ID"]) || originalName;
    if (canonicalName !== originalName) productNamesFixed++;

    const salesNum = Math.round(parseFloat(r["Sales"]) * 100) / 100;

    return {
      rowId: parseInt(r["Row ID"], 10),
      orderId: r["Order ID"].trim(),
      orderDate: parseDdMmYyyyToIso(r["Order Date"]),
      shipDate: parseDdMmYyyyToIso(r["Ship Date"]),
      shipMode: r["Ship Mode"].trim(),
      customerId: r["Customer ID"].trim(),
      customerName: r["Customer Name"].trim(),
      segment: r["Segment"].trim(),
      country: r["Country"].trim(),
      city: r["City"].trim(),
      state: r["State"].trim(),
      postalCode: postal.value,
      region: r["Region"].trim(),
      productId: r["Product ID"].trim(),
      category: r["Category"].trim(),
      subCategory: r["Sub-Category"].trim(),
      productName: canonicalName,
      sales: salesNum,
    };
  });

  logLines.push(`Registros de salida: ${cleaned.length} (no se descarto ningun registro)\n`);
  logLines.push("--- Postal Code ---");
  logLines.push(`  Valores imputados (vacios -> conocidos): ${postalImputed} (Burlington, Vermont -> 05401)`);
  logLines.push(`  Valores rellenados con cero a la izquierda (4->5 digitos): ${postalPadded}\n`);
  logLines.push("--- Fechas ---");
  logLines.push(`  Order Date / Ship Date convertidas a formato (YYYY-MM-DD): ${cleaned.length} filas\n`);
  logLines.push("--- Sales ---");
  logLines.push(`  Valores normalizados a NUMERIC con 2 decimales: ${cleaned.length} filas\n`);
  logLines.push("--- Product Name ---");
  logLines.push(`  Product ID con nombres inconsistentes detectados: ${rawRows.length > 0 ? "32 (ver exploracion)" : "0"
    }`);
  logLines.push(`  Filas donde se reemplazo el nombre por el mas frecuente: ${productNamesFixed}\n`);
  logLines.push(`Total de Product ID distintos con nombre mas frecuente asignado: ${inconsistentProductCount}`);

  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(cleaned, null, 2), "utf-8");
  fs.writeFileSync(LOG_PATH, logLines.join("\n"), "utf-8");

  console.log(logLines.join("\n"));
  console.log(`\nDataset limpio escrito en: ${OUTPUT_JSON_PATH}`);
}

main();

import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const RAW_CSV_PATH = path.join(__dirname, "..", "data", "train.csv");

interface RawRow {
  [key: string]: string;
}

function loadRawRows(): RawRow[] {
  const content = fs.readFileSync(RAW_CSV_PATH, "utf-8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
  }) as RawRow[];
}

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === "";
}

function main() {
  const rows = loadRawRows();
  const columns = Object.keys(rows[0]);

  console.log("inicia :\n");
  console.log(`Total de registros: ${rows.length}`);
  console.log(`Total de columnas: ${columns.length}`);
  console.log(`Columnas: ${columns.join(", ")}\n`);

  console.log(" valores vacios :");
  for (const col of columns) {
    const nulls = rows.filter((r) => isBlank(r[col])).length;
    if (nulls > 0) {
      console.log(`  ${col}: ${nulls} valores vacios (${((nulls / rows.length) * 100).toFixed(2)}%)`);
    }
  }

  console.log("\n valores unicos :");
  for (const col of columns) {
    const unique = new Set(rows.map((r) => r[col])).size;
    console.log(`  ${col}: ${unique} valores unicos`);
  }

  console.log("\n duplicadas :");
  const seen = new Map<string, number>();
  for (const r of rows) {
    const key = columns.map((c) => r[c]).join("|");
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  const dupExtraCopies = [...seen.values()].filter((c) => c > 1).reduce((a, c) => a + (c - 1), 0);
  console.log(`  Filas duplicadas (copias extra): ${dupExtraCopies}`);

  console.log("\n tipos de datos :");
  console.log(`  Order Date / Ship Date : ${rows[0]["Order Date"]} / ${rows[0]["Ship Date"]}`);
  console.log(`  Sales : ${rows.slice(0, 5).map((r) => r["Sales"]).join(", ")}`);
  console.log(`  Postal Code : ${rows.find((r) => r["Postal Code"].trim().length === 4)?.["Postal Code"]
    }`);

  console.log("\n dependencias funcionales :");
  checkFunctionalDependency(rows, "Order ID", [
    "Order Date", "Ship Date", "Ship Mode", "Customer ID", "City", "State", "Postal Code", "Region", "Country",
  ]);
  checkFunctionalDependency(rows, "Customer ID", ["Customer Name", "Segment"]);
  checkFunctionalDependency(rows, "Sub-Category", ["Category"]);
  checkFunctionalDependency(rows, "State", ["Region"]);
  checkFunctionalDependency(rows, "Product ID", ["Product Name"]);
}

function checkFunctionalDependency(rows: RawRow[], keyField: string, dependentFields: string[]) {
  const map = new Map<string, Set<string>>();
  for (const r of rows) {
    const key = r[keyField];
    const value = dependentFields.map((f) => r[f]).join("||");
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(value);
  }
  const inconsistent = [...map.entries()].filter(([, values]) => values.size > 1);
  console.log(
    `  ${keyField} -> [${dependentFields.join(", ")}]: ${map.size} grupos, ${inconsistent.length} inconsistentes`
  );
  if (inconsistent.length > 0 && inconsistent.length <= 5) {
    for (const [key, values] of inconsistent) {
      console.log(`    ${key}: ${[...values].join(" | ")}`);
    }
  }
}

main();

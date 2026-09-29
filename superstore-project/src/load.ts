import * as fs from "fs";
import * as path from "path";
import { pool } from "./db";
import { CleanedRow } from "./clean";

const CLEANED_JSON_PATH = path.join(__dirname, "..", "data", "cleaned.json");

async function main() {
  const rows: CleanedRow[] = JSON.parse(fs.readFileSync(CLEANED_JSON_PATH, "utf-8"));
  console.log(`filas leidas: ${rows.length}`);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const regionIds = new Map<string, number>();
    for (const name of new Set(rows.map((r) => r.region))) {
      const res = await client.query(
        `INSERT INTO regions (region_name) VALUES ($1)
         ON CONFLICT (region_name) DO UPDATE SET region_name = EXCLUDED.region_name
         RETURNING region_id`,
        [name]
      );
      regionIds.set(name, res.rows[0].region_id);
    }
    console.log(`regions insertadas: ${regionIds.size}`);

    const stateToRegion = new Map<string, string>();
    for (const r of rows) stateToRegion.set(r.state, r.region);
    const stateIds = new Map<string, number>();
    for (const [stateName, regionName] of stateToRegion.entries()) {
      const res = await client.query(
        `INSERT INTO states (state_name, region_id) VALUES ($1, $2)
          ON CONFLICT (state_name) DO UPDATE SET region_id = EXCLUDED.region_id
          RETURNING state_id`,
        [stateName, regionIds.get(regionName)]
      );
      stateIds.set(stateName, res.rows[0].state_id);
    }
    console.log(`states insertados: ${stateIds.size}`);

    const locationKey = (r: CleanedRow) => `${r.city}||${r.state}||${r.postalCode}||${r.country}`;
    const locationIds = new Map<string, number>();
    const uniqueLocations = new Map<string, CleanedRow>();
    for (const r of rows) uniqueLocations.set(locationKey(r), r);
    for (const r of uniqueLocations.values()) {
      const res = await client.query(
        `INSERT INTO locations (city, state_id, postal_code, country) VALUES ($1, $2, $3, $4)
          ON CONFLICT (city, state_id, postal_code) DO UPDATE SET country = EXCLUDED.country
          RETURNING location_id`,
        [r.city, stateIds.get(r.state), r.postalCode, r.country]
      );
      locationIds.set(locationKey(r), res.rows[0].location_id);
    }
    console.log(`locations insertadas: ${locationIds.size}`);

    const categoryIds = new Map<string, number>();
    for (const name of new Set(rows.map((r) => r.category))) {
      const res = await client.query(
        `INSERT INTO categories (category_name) VALUES ($1)
          ON CONFLICT (category_name) DO UPDATE SET category_name = EXCLUDED.category_name
          RETURNING category_id`,
        [name]
      );
      categoryIds.set(name, res.rows[0].category_id);
    }
    console.log(`categories insertadas: ${categoryIds.size}`);

    const subcatToCategory = new Map<string, string>();
    for (const r of rows) subcatToCategory.set(r.subCategory, r.category);
    const subcategoryIds = new Map<string, number>();
    for (const [subcatName, catName] of subcatToCategory.entries()) {
      const res = await client.query(
        `INSERT INTO subcategories (subcategory_name, category_id) VALUES ($1, $2)
          ON CONFLICT (subcategory_name) DO UPDATE SET category_id = EXCLUDED.category_id
          RETURNING subcategory_id`,
        [subcatName, categoryIds.get(catName)]
      );
      subcategoryIds.set(subcatName, res.rows[0].subcategory_id);
    }
    console.log(`subcategories insertadas: ${subcategoryIds.size}`);

    const productMap = new Map<string, CleanedRow>();
    for (const r of rows) productMap.set(r.productId, r);
    for (const r of productMap.values()) {
      await client.query(
        `INSERT INTO products (product_id, product_name, subcategory_id) VALUES ($1, $2, $3)
          ON CONFLICT (product_id) DO UPDATE SET product_name = EXCLUDED.product_name, subcategory_id = EXCLUDED.subcategory_id`,
        [r.productId, r.productName, subcategoryIds.get(r.subCategory)]
      );
    }
    console.log(`products insertados: ${productMap.size}`);

    const shipModeIds = new Map<string, number>();
    for (const name of new Set(rows.map((r) => r.shipMode))) {
      const res = await client.query(
        `INSERT INTO ship_modes (ship_mode_name) VALUES ($1)
         ON CONFLICT (ship_mode_name) DO UPDATE SET ship_mode_name = EXCLUDED.ship_mode_name
         RETURNING ship_mode_id`,
        [name]
      );
      shipModeIds.set(name, res.rows[0].ship_mode_id);
    }
    console.log(`ship_modes insertados: ${shipModeIds.size}`);

    const customerMap = new Map<string, CleanedRow>();
    for (const r of rows) customerMap.set(r.customerId, r);
    for (const r of customerMap.values()) {
      await client.query(
        `INSERT INTO customers (customer_id, customer_name, segment) VALUES ($1, $2, $3)
         ON CONFLICT (customer_id) DO UPDATE SET customer_name = EXCLUDED.customer_name, segment = EXCLUDED.segment`,
        [r.customerId, r.customerName, r.segment]
      );
    }
    console.log(`customers insertados: ${customerMap.size}`);

    const orderMap = new Map<string, CleanedRow>();
    for (const r of rows) orderMap.set(r.orderId, r);
    for (const r of orderMap.values()) {
      await client.query(
        `INSERT INTO orders (order_id, order_date, ship_date, ship_mode_id, customer_id, location_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (order_id) DO NOTHING`,
        [
          r.orderId,
          r.orderDate,
          r.shipDate,
          shipModeIds.get(r.shipMode),
          r.customerId,
          locationIds.get(locationKey(r)),
        ]
      );
    }
    console.log(`orders insertadas: ${orderMap.size}`);

    for (const r of rows) {
      await client.query(
        `INSERT INTO order_items (row_id, order_id, product_id, sales) VALUES ($1, $2, $3, $4)
         ON CONFLICT (row_id) DO NOTHING`,
        [r.rowId, r.orderId, r.productId, r.sales]
      );
    }
    console.log(`order_items insertados: ${rows.length}`);

    await client.query("COMMIT");
    console.log("\nCOMMIT confirmada.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error durante la carga, se ejecuto ROLLBACK:", err);
    throw err;
  } finally {
    client.release();
  }

  const countRes = await pool.query("SELECT COUNT(*)::int AS c FROM order_items");
  const loadedCount = countRes.rows[0].c;
  console.log(`\nVerificacion: order_items en BD = ${loadedCount}, filas en cleaned.json = ${rows.length}`);
  if (loadedCount !== rows.length) {
    throw new Error("La cantidad de filas cargadas NO coincide con el dataset transformado.");
  }
  console.log("OK: la carga total de filas coincide con el conjunto de datos transformado.");

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

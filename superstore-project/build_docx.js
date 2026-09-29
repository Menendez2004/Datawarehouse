const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  ImageRun,
  AlignmentType,
  PageBreak,
  VerticalAlign,
} = require("docx");

const PROJECT = __dirname;
const readFile = (p) => fs.readFileSync(path.join(PROJECT, p), "utf-8");

// ---------- Page geometry (US Letter) ----------
const PAGE = { width: 12240, height: 15840 };
const MARGIN = { top: 1080, bottom: 1080, left: 1260, right: 1260 };

// ---------- Style helpers ----------
const CODE_FONT = "Consolas";
const BODY_FONT = "Calibri";
const NAVY = "1F3864";
const ACCENT = "2C5F8A";
const LIGHT_SHADE = "F2F5F8";
const CODE_SHADE = "F4F4F4";

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
  });
}
function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 140 },
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: BODY_FONT, size: 22, ...opts })],
    spacing: { after: 160 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
  });
}
function pRich(runs, opts = {}) {
  return new Paragraph({ children: runs, spacing: { after: 160 }, ...opts });
}
function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: BODY_FONT, size: 22 })],
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}
function codeBlock(code) {
  const lines = code.split("\n");
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: CODE_SHADE, color: "auto" },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
            },
            children: lines.map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line.length ? line : " ", font: CODE_FONT, size: 16 })],
                  spacing: { after: 0 },
                })
            ),
          }),
        ],
      }),
    ],
  });
}
function spacer(h = 120) {
  return new Paragraph({ text: "", spacing: { after: h } });
}
function simpleTable(headers, rows, colWidths) {
  const total = 9360;
  const widths = colWidths || headers.map(() => Math.floor(total / headers.length));
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (htext, i) =>
        new TableCell({
          width: { size: widths[i], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: ACCENT, color: "auto" },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: htext, bold: true, color: "FFFFFF", font: BODY_FONT, size: 20 })],
            }),
          ],
        })
    ),
  });
  const bodyRows = rows.map(
    (row, ri) =>
      new TableRow({
        children: row.map(
          (cell, i) =>
            new TableCell({
              width: { size: widths[i], type: WidthType.DXA },
              shading: {
                type: ShadingType.CLEAR,
                fill: ri % 2 === 0 ? "FFFFFF" : LIGHT_SHADE,
                color: "auto",
              },
              margins: { top: 70, bottom: 70, left: 100, right: 100 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: String(cell), font: BODY_FONT, size: 20 })],
                }),
              ],
            })
        ),
      })
  );
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...bodyRows],
  });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ---------- Content pieces ----------
const schemaSQL = readFile("sql/schema.sql");
const businessSQL = readFile("sql/business_questions.sql");

const children = [];

// ================= PORTADA =================
children.push(
  new Paragraph({ text: "", spacing: { after: 1200 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "UNIVERSIDAD DON BOSCO", bold: true, size: 40, color: NAVY, font: BODY_FONT })],
    spacing: { after: 120 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Datawarehouse y Minería de Datos", size: 28, color: ACCENT, font: BODY_FONT })],
    spacing: { after: 60 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Desafío Práctico 1 — Experiencia de Aprendizaje 1", size: 24, font: BODY_FONT })],
    spacing: { after: 800 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "Documento Técnico",
        bold: true,
        size: 32,
        font: BODY_FONT,
      }),
    ],
    spacing: { after: 60 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "Proceso ETL, Modelado de Datos y Consultas de Negocio — Superstore Sales Dataset",
        italics: true,
        size: 24,
        font: BODY_FONT,
      }),
    ],
    spacing: { after: 800 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Autor: Kevin Menendez", size: 22, font: BODY_FONT })],
    spacing: { after: 40 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Agrupamiento: Individual", size: 22, font: BODY_FONT })],
    spacing: { after: 40 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Fecha de entrega: 25 de septiembre", size: 22, font: BODY_FONT })],
    spacing: { after: 40 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: "Stack técnico: Node.js + TypeScript + PostgreSQL", size: 22, font: BODY_FONT }),
    ],
  }),
  pageBreak()
);

// ================= 1. INTRODUCCION =================
children.push(
  h1("1. Introducción"),
  p(
    "El presente documento describe, de forma técnica y detallada, el proceso completo de ingeniería de datos aplicado al archivo train.csv del conjunto de datos “Superstore Sales”. El objetivo es transformar un archivo crudo en un modelo relacional normalizado, cargarlo en un motor de base de datos y responder un conjunto de preguntas de negocio mediante consultas SQL."
  ),
  p(
    "El proceso sigue las etapas solicitadas en la guía de la actividad: importación, exploración inicial, limpieza, normalización y estandarización, modelado entidad-relación, creación del esquema (DDL), inserción de datos y resolución de preguntas de negocio."
  ),
  h2("1.1 Herramientas y tecnologías utilizadas"),
  bullet("Lenguaje / runtime: Node.js v22 con TypeScript."),
  bullet("Lectura de CSV: librería csv-parse."),
  bullet("Motor de base de datos: PostgreSQL 16."),
  bullet("Cliente de base de datos: librería pg (node-postgres), con consultas parametrizadas y transacciones."),
  bullet("Diagrama entidad-relación: Graphviz."),
  spacer()
);

// ================= 2. IMPORTACION =================
children.push(
  h1("2. Importación de Datos"),
  p(
    "El archivo train.csv fue leído utilizando la librería csv-parse en su modo síncrono, interpretando la primera fila como encabezado de columnas. El archivo contiene 9,800 registros y 18 columnas: Row ID, Order ID, Order Date, Ship Date, Ship Mode, Customer ID, Customer Name, Segment, Country, City, State, Postal Code, Region, Product ID, Category, Sub-Category, Product Name y Sales."
  ),
  h2("2.1 Fragmento de código — lectura del CSV (src/explore.ts)"),
  codeBlock(
    `const content = fs.readFileSync(RAW_CSV_PATH, "utf-8");
const rows = parse(content, {
  columns: true,
  skip_empty_lines: true,
}) as RawRow[];`
  ),
  spacer()
);

// ================= 3. EXPLORACION INICIAL =================
children.push(
  h1("3. Exploración Inicial"),
  p(
    "Se ejecutó un análisis descriptivo preliminar (src/explore.ts) para determinar la cantidad de registros, la estructura del archivo, los tipos de datos observados y la calidad general de los datos."
  ),
  h2("3.1 Resumen general"),
  simpleTable(
    ["Métrica", "Valor"],
    [
      ["Total de registros", "9,800"],
      ["Total de columnas", "18"],
      ["Filas totalmente duplicadas", "0"],
      ["Rango de fechas de orden", "2015-01-03 a 2018-12-30"],
      ["Órdenes únicas (Order ID)", "4,922"],
      ["Clientes únicos (Customer ID)", "793"],
      ["Productos únicos (Product ID)", "1,861"],
    ]
  ),
  spacer(),
  h2("3.2 Tipos de datos observados (crudos, como texto)"),
  simpleTable(
    ["Columna", "Tipo observado en CSV", "Tipo destino"],
    [
      ["Order Date / Ship Date", "Texto, formato DD/MM/YYYY", "DATE (ISO 8601)"],
      ["Postal Code", "Texto, 4 o 5 dígitos, 11 vacíos", "CHAR(5)"],
      ["Sales", "Texto, 0 a 4 decimales", "NUMERIC(12,2)"],
      ["Row ID", "Texto numérico", "INTEGER"],
      ["Resto de columnas", "Texto (categórico / nominal)", "TEXT"],
    ],
    [3600, 3200, 2560]
  ),
  spacer(),
  h2("3.3 Valores nulos / vacíos detectados"),
  p("La única columna con valores vacíos es Postal Code, con 11 registros (0.11% del total), todos correspondientes a la ciudad de Burlington, Vermont."),
  h2("3.4 Análisis de dependencias funcionales"),
  p(
    "Antes de diseñar el modelo relacional, se validó qué columnas dependen funcionalmente de otras, es decir, si para un mismo valor de una columna clave siempre se observa el mismo valor en las columnas dependientes. Esto sustenta las decisiones de normalización del paso 5."
  ),
  simpleTable(
    ["Dependencia evaluada", "Grupos", "Inconsistencias", "Conclusión"],
    [
      ["Order ID → fecha, envío, cliente, ubicación", "4,922", "0", "Se modela como encabezado de orden (tabla orders)"],
      ["Customer ID → nombre, segmento", "793", "0", "Se modela como dimensión customers"],
      ["Sub-Category → Category", "17", "0", "Se modela jerarquía categories → subcategories"],
      ["State → Region", "49", "0", "Se modela jerarquía regions → states"],
      ["Product ID → Product Name", "1,861", "32", "Se resuelve en limpieza (nombre canónico)"],
    ],
    [3200, 1400, 1800, 2960]
  ),
  spacer()
);

// ================= 4. LIMPIEZA =================
children.push(
  h1("4. Limpieza de Datos"),
  p("Se identificaron y gestionaron los siguientes problemas de calidad de datos (src/clean.ts):"),
  h2("4.1 Registros duplicados"),
  p("No se encontraron filas completamente duplicadas en el archivo original (0 de 9,800), por lo que no fue necesario eliminar registros."),
  h2("4.2 Valores nulos — Postal Code"),
  p(
    "Los 11 registros con Postal Code vacío corresponden todos a Burlington, Vermont. Dado que la combinación ciudad + estado identifica de forma inequívoca el código postal principal de esa localidad, se imputó el valor conocido 05401 en lugar de descartar los registros o dejarlos nulos, preservando así la integridad referencial hacia la dimensión de ubicación."
  ),
  h2("4.3 Inconsistencia de nombres de producto"),
  p(
    "Se detectaron 32 Product ID asociados a más de un Product Name distinto (por ejemplo, el mismo SKU registrado en una orden como “DAX Solid Wood Frames” y en otra como “Howard Miller ... Wall Clock”). La Categoría y Subcategoría de cada Product ID sí eran consistentes en el 100% de los casos, por lo que el problema se limita al texto del nombre. Se resolvió asignando como nombre canónico el valor más frecuente para cada Product ID (en caso de empate, orden alfabético). Esto afectó el nombre mostrado en 125 de las 9,800 filas."
  ),
  spacer()
);

// ================= 5. NORMALIZACION Y ESTANDARIZACION =================
children.push(
  h1("5. Normalización y Estandarización de Formatos"),
  h2("5.1 Fechas"),
  p("Order Date y Ship Date se encontraban en formato de texto DD/MM/YYYY (confirmado al observar 5,841 fechas con el primer componente mayor a 12, lo cual descarta el formato MM/DD/YYYY). Se convirtieron a formato ISO 8601 (YYYY-MM-DD) y al tipo DATE nativo de PostgreSQL."),
  h2("5.2 Código postal"),
  p("429 registros tenían el código postal almacenado con 4 dígitos por pérdida del cero inicial (por ejemplo, códigos de New Jersey como 6824). Se aplicó relleno de ceros a la izquierda para normalizar todos los códigos a 5 dígitos y se definió la columna como CHAR(5)."),
  h2("5.3 Valores monetarios (Sales)"),
  p("La columna Sales presentaba una cantidad variable de decimales (entre 0 y 4). Se estandarizó a un valor numérico con exactamente 2 decimales (redondeo estándar), acorde al tipo NUMERIC(12,2) usado para representar montos monetarios."),
  h2("5.4 Resumen de transformaciones aplicadas"),
  simpleTable(
    ["Transformación", "Registros afectados"],
    [
      ["Código postal imputado (vacío → 05401)", "11"],
      ["Código postal rellenado con cero a la izquierda", "429"],
      ["Fechas convertidas a ISO 8601", "9,800 (Order Date y Ship Date)"],
      ["Sales normalizado a 2 decimales", "9,800"],
      ["Nombre de producto reemplazado por canónico", "125"],
    ]
  ),
  spacer()
);

// ================= 6. MODELADO DE DATOS =================
children.push(pageBreak());
children.push(
  h1("6. Modelado de Datos — Diagrama Entidad-Relación"),
  p(
    "El modelo lógico se diseñó aplicando formas normales para evitar redundancias, basándose en las dependencias funcionales validadas en la sección 3.4. Se identificaron dos jerarquías de dimensión (geográfica y de producto), catálogos simples, y una relación de encabezado/detalle para las órdenes."
  ),
  h2("6.1 Justificación de la normalización"),
  bullet("1FN: todos los atributos son atómicos (por ejemplo, no se combina ciudad+estado+CP en un solo campo de texto)."),
  bullet("2FN/3FN: se eliminan dependencias transitivas — Region depende de State (no de Order), y Category depende de Sub-Category (no de Product), por lo que se extraen a tablas propias en lugar de repetirse en cada fila."),
  bullet("Segment depende únicamente de Customer ID (no de la orden), por lo que se modela como atributo de customers y no de orders."),
  bullet("El grano de order_items es una fila por Row ID del CSV original (línea de producto dentro de una orden); el grano de orders es una fila por Order ID (encabezado del pedido)."),
  spacer(),
  h2("6.2 Diagrama Entidad-Relación"),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new ImageRun({
        type: "png",
        data: fs.readFileSync(path.join(PROJECT, "diagrams", "er_diagram.png")),
        transformation: { width: 620, height: 376 },
      }),
    ],
    spacing: { before: 120, after: 120 },
  }),
  h2("6.3 Descripción de entidades"),
  simpleTable(
    ["Tabla", "Descripción", "Llave primaria"],
    [
      ["regions", "Región geográfica de venta (4 valores)", "region_id"],
      ["states", "Estado de EE.UU., referencia a region", "state_id"],
      ["locations", "Ciudad + código postal + país, referencia a state", "location_id"],
      ["categories", "Categoría de producto (3 valores)", "category_id"],
      ["subcategories", "Subcategoría, referencia a category", "subcategory_id"],
      ["products", "Catálogo de productos, referencia a subcategory", "product_id"],
      ["ship_modes", "Modo de envío (4 valores)", "ship_mode_id"],
      ["customers", "Cliente y su segmento", "customer_id"],
      ["orders", "Encabezado de orden: fechas, cliente, ubicación, envío", "order_id"],
      ["order_items", "Detalle/hecho: producto y venta por línea de orden", "row_id"],
    ],
    [1800, 5300, 2260]
  ),
  spacer()
);

// ================= 7. CREACION DEL ESQUEMA =================
children.push(pageBreak());
children.push(
  h1("7. Creación del Esquema (Script DDL)"),
  p("El siguiente script DDL crea las diez tablas del modelo en PostgreSQL, definiendo llaves primarias, llaves foráneas, restricciones de integridad (CHECK, UNIQUE) e índices sobre las columnas de llave foránea utilizadas en los JOIN de las consultas de negocio."),
  codeBlock(schemaSQL.trim()),
  spacer()
);

// ================= 8. INSERCION DE DATOS =================
children.push(pageBreak());
children.push(
  h1("8. Inserción de Datos"),
  p(
    "La carga (src/load.ts) inserta los datos limpios respetando el orden de dependencias de llave foránea: primero las dimensiones independientes y jerárquicas (regions → states → locations, categories → subcategories → products, ship_modes, customers) y luego las tablas dependientes (orders, order_items). Toda la carga se ejecuta dentro de una única transacción (BEGIN/COMMIT), con ROLLBACK automático ante cualquier error."
  ),
  h2("8.1 Fragmento de código — transacción e inserción de order_items"),
  codeBlock(
    `await client.query("BEGIN");
// ... insercion de dimensiones (regions, states, locations,
//     categories, subcategories, products, ship_modes, customers) ...
// ... insercion de orders (grano: un registro por Order ID) ...
for (const r of rows) {
  await client.query(
    \`INSERT INTO order_items (row_id, order_id, product_id, sales)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (row_id) DO NOTHING\`,
    [r.rowId, r.orderId, r.productId, r.sales]
  );
}
await client.query("COMMIT");`
  ),
  h2("8.2 Verificación de integridad de la carga"),
  p("Tras la carga, se comparó la cantidad de filas insertadas en order_items contra la cantidad de filas del conjunto de datos transformado:"),
  simpleTable(
    ["Tabla", "Filas cargadas"],
    [
      ["regions", "4"],
      ["states", "49"],
      ["locations", "628"],
      ["categories", "3"],
      ["subcategories", "17"],
      ["products", "1,861"],
      ["ship_modes", "4"],
      ["customers", "793"],
      ["orders", "4,922"],
      ["order_items", "9,800"],
    ]
  ),
  spacer(),
  p("Resultado de la verificación: order_items en BD = 9,800, filas en el dataset transformado = 9,800 → coinciden exactamente. La transacción se confirmó con COMMIT sin errores.", { bold: true }),
  spacer()
);

// ================= 9. PREGUNTAS DE NEGOCIO =================
children.push(pageBreak());
children.push(
  h1("9. Preguntas de Negocio"),
  p(
    "Nota sobre disponibilidad de datos: el archivo train.csv no incluye una columna de utilidad/costo (Profit), únicamente Sales (ingresos). Por acuerdo explícito, la pregunta de “rentabilidad” se responde utilizando el total de Sales como métrica proxy de rentabilidad, documentando esta limitación de la fuente de datos.",
    { italics: true }
  ),
  h2("9.1 ¿Cuál es la categoría y subcategoría que genera el mayor volumen de ingresos?"),
  codeBlock(
    `SELECT c.category_name, sc.subcategory_name, ROUND(SUM(oi.sales), 2) AS ventas_totales
FROM order_items oi
JOIN products p       ON p.product_id = oi.product_id
JOIN subcategories sc ON sc.subcategory_id = p.subcategory_id
JOIN categories c     ON c.category_id = sc.category_id
GROUP BY c.category_name, sc.subcategory_name
ORDER BY ventas_totales DESC
LIMIT 1;`
  ),
  spacer(80),
  simpleTable(
    ["Category", "Sub-Category", "Ventas totales (USD)"],
    [["Technology", "Phones", "327,782.49"]]
  ),
  spacer(),
  p("Respuesta: la categoría Technology, subcategoría Phones, genera el mayor volumen de ingresos: $327,782.49.", { bold: true }),

  h2("9.2 ¿Quiénes son los cinco clientes con mayor rentabilidad (proxy: ventas totales)?"),
  codeBlock(
    `SELECT c.customer_id, c.customer_name, ROUND(SUM(oi.sales), 2) AS ventas_totales
FROM order_items oi
JOIN orders o     ON o.order_id = oi.order_id
JOIN customers c  ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name
ORDER BY ventas_totales DESC
LIMIT 5;`
  ),
  spacer(80),
  simpleTable(
    ["Customer ID", "Cliente", "Ventas totales (USD)"],
    [
      ["SM-20320", "Sean Miller", "25,043.07"],
      ["TC-20980", "Tamara Chand", "19,052.22"],
      ["RB-19360", "Raymond Buch", "15,117.35"],
      ["TA-21385", "Tom Ashbrook", "14,595.62"],
      ["AB-10105", "Adrian Barton", "14,473.57"],
    ]
  ),
  spacer(),
  p("Respuesta: Sean Miller, Tamara Chand, Raymond Buch, Tom Ashbrook y Adrian Barton son, en ese orden, los cinco clientes con mayor total de ventas históricas.", { bold: true }),

  h2("9.3 ¿Cuál fue el mes con más y con menos órdenes realizadas?"),
  p("Se agrupó por mes calendario (Enero a Diciembre) considerando las órdenes de los cuatro años del dataset (2015–2018), ya que la pregunta se refiere al mes del año, no a un mes-año específico."),
  codeBlock(
    `WITH ordenes_por_mes AS (
  SELECT EXTRACT(MONTH FROM order_date)::int AS mes_numero,
         TO_CHAR(order_date, 'Month') AS mes_nombre,
         COUNT(*) AS cantidad_ordenes
  FROM orders
  GROUP BY EXTRACT(MONTH FROM order_date), TO_CHAR(order_date, 'Month')
)
SELECT 'Mayor cantidad' AS tipo, * FROM ordenes_por_mes ORDER BY cantidad_ordenes DESC LIMIT 1
UNION ALL
SELECT 'Menor cantidad' AS tipo, * FROM ordenes_por_mes ORDER BY cantidad_ordenes ASC LIMIT 1;`
  ),
  spacer(80),
  simpleTable(
    ["Tipo", "Mes", "Cantidad de órdenes"],
    [
      ["Mayor cantidad", "Noviembre", "743"],
      ["Menor cantidad", "Febrero", "161"],
    ]
  ),
  spacer(),
  p("Respuesta: Noviembre fue el mes con mayor cantidad de órdenes (743) y Febrero el mes con menor cantidad (161).", { bold: true }),
  spacer()
);

// ================= 10. CONCLUSIONES =================
children.push(
  h1("10. Conclusiones"),
  bullet("Se procesaron exitosamente 9,800 registros crudos, sin descartar ninguno, resolviendo problemas de nulos, formato de fecha, formato monetario, código postal y nombres de producto inconsistentes."),
  bullet("El modelo relacional resultante (10 tablas) normaliza las jerarquías geográfica y de producto, evitando la redundancia presente en el archivo plano original."),
  bullet("La carga a PostgreSQL se realizó de forma transaccional y se verificó una correspondencia exacta de 9,800 filas entre el dataset transformado y la tabla de hechos order_items."),
  bullet("Las tres preguntas de negocio fueron respondidas mediante consultas SQL sobre el modelo normalizado, documentando explícitamente la limitación de datos relacionada con la ausencia de una columna de utilidad/costo."),
);

// ================= BUILD DOC =================
const doc = new Document({
  sections: [
    {
      properties: {
        page: { size: PAGE, margin: MARGIN },
      },
      children,
    },
  ],
  styles: {
    default: {
      document: { run: { font: BODY_FONT, size: 22 } },
      heading1: { run: { color: NAVY, size: 30, bold: true, font: BODY_FONT }, paragraph: { spacing: { before: 300, after: 160 } } },
      heading2: { run: { color: ACCENT, size: 26, bold: true, font: BODY_FONT }, paragraph: { spacing: { before: 220, after: 120 } } },
    },
  },
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(PROJECT, "output", "Desafio_Practico_1_Documento_Tecnico.docx"), buffer);
  console.log("Documento generado.");
});

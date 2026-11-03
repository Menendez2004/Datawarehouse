# Desafío Práctico 2 — Cubo OLAP con AdventureWorksDW (UDB · DMD941)

Restauración de **AdventureWorksDW** en SQL Server, diseño y procesamiento de un cubo OLAP en
Visual Studio (SSAS Multidimensional) y visualización en Power BI.

> **El archivo `.bak` no se incluye en el repositorio** por su tamaño (está en `.gitignore`).
> Descárguelo de la columna *Data Warehouse* en
> <https://learn.microsoft.com/sql/samples/adventureworks-install-configure>
> eligiendo el año que coincida con su versión de SQL Server.

## Estructura

```
adventureworks-olap/
├── sql/
│   ├── 01_restaurar_base_datos.sql      # Paso 1: RESTORE FILELISTONLY + RESTORE DATABASE
│   ├── 02_verificacion_restauracion.sql # Paso 2: inventario, relaciones, calidad de datos
│   └── 03_problemas_negocio.sql         # Paso 3: consultas SQL de los 6 problemas
├── olap/
│   ├── AdventureWorksOLAP/              # (proyecto de Visual Studio, se crea con la guía)
│   └── consultas_cubo.mdx               # Consultas MDX para validar el cubo
├── powerbi/
│   └── Dashboard_AdventureWorks.pbix    # (se crea con la guía)
├── database/                            # Coloque aquí el .bak localmente (ignorado por git)
└── docs/
    ├── guia_cubo_ssas.md                # Paso a paso del cubo con capturas requeridas
    ├── guia_powerbi.md                  # Paso a paso de Power BI
    ├── documento_entrega.md             # Plantilla del PDF final (portada incluida)
    └── capturas/                        # Capturas de pantalla para el PDF
```

## Orden de trabajo

1. Restaurar la base → `sql/01_restaurar_base_datos.sql`
2. Verificar y explorar → `sql/02_verificacion_restauracion.sql`
3. Resolver los problemas en SQL → `sql/03_problemas_negocio.sql`
4. Crear, desplegar y procesar el cubo → `docs/guia_cubo_ssas.md`
5. Validar el cubo con MDX → `olap/consultas_cubo.mdx`
6. Conectar Power BI → `docs/guia_powerbi.md`
7. Completar `docs/documento_entrega.md`, exportar a PDF y subir todo a GitHub.

## Modelo dimensional del cubo "Ventas Internet"

| Elemento | Origen |
|---|---|
| Hecho | `FactInternetSales` |
| Medidas | Ventas, Costo, Utilidad, Unidades, Órdenes, Margen % (calculada) |
| Dim. Fecha | `DimDate` — Año → Trimestre → Mes → Fecha |
| Dim. Producto | `DimProduct` → `DimProductSubcategory` → `DimProductCategory` |
| Dim. Cliente | `DimCustomer` — género, estado civil, educación, ingreso |
| Dim. Territorio | `DimSalesTerritory` — Grupo → País → Región |
| Dim. Promoción | `DimPromotion` |

## Problemas de negocio

1. Evolución de ventas y utilidad por año y trimestre (crecimiento interanual).
2. Categorías y subcategorías con mayor ingreso y margen.
3. Top 10 productos más rentables.
4. Concentración de ventas por territorio.
5. Perfil del cliente que más compra.
6. Impacto de las promociones en las ventas.

# Guía: creación del cubo OLAP en Visual Studio (SSAS Multidimensional)

Nombre del cubo: **Ventas Internet**. Hecho: `dbo.FactInternetSales`.
Al final de cada paso hay una indicación 📸 de la captura que debe ir al PDF
(guárdelas en `docs/capturas/` con el nombre sugerido).

---

## 0. Requisitos

| Herramienta | Detalle |
|---|---|
| SQL Server (motor de base de datos) | Con `AdventureWorksDW2022` restaurada (ver `sql/01_restaurar_base_datos.sql`) |
| SQL Server Analysis Services | Instalado en modo **Multidimensional**. Se agrega desde el instalador de SQL Server → *Add features* → *Analysis Services* → *Multidimensional and Data Mining Mode* |
| Visual Studio 2022 | Con la extensión **Microsoft Analysis Services Projects 2022** (Extensions → Manage Extensions) |
| SSMS | Para probar las consultas MDX |

> Si SSAS quedó instalado en modo Tabular, el proyecto multidimensional no se podrá desplegar.
> Compruébelo en SSMS: conéctese a Analysis Services; en un servidor Tabular verá *Databases* con iconos de modelo tabular.

---

## 1. Crear el proyecto

1. *File → New → Project →* **Analysis Services Multidimensional and Data Mining Project**.
2. Nombre: `AdventureWorksOLAP`. Ubicación: la carpeta `adventureworks-olap/olap/` de este repositorio.

📸 `01_nuevo_proyecto.png`

---

## 2. Origen de datos (Data Source)

1. *Solution Explorer →* clic derecho en **Data Sources → New Data Source**.
2. *New...* → Provider: **Native OLE DB\Microsoft OLE DB Driver for SQL Server**
   (o *SQL Server Native Client 11.0*), Server: `localhost` (o `.\SQLEXPRESS`),
   Database: `AdventureWorksDW2022`. → *Test Connection*.
3. *Impersonation Information*: **Use the service account**.
4. Nombre: `AdventureWorksDW`.

> **Error frecuente al procesar:** `Login failed for user 'NT SERVICE\MSSQLServerOLAPService'`.
> Solución: ejecutar en el motor SQL Server:
> ```sql
> USE master;  CREATE LOGIN [NT SERVICE\MSSQLServerOLAPService] FROM WINDOWS;
> USE AdventureWorksDW2022;
> CREATE USER [NT SERVICE\MSSQLServerOLAPService] FOR LOGIN [NT SERVICE\MSSQLServerOLAPService];
> ALTER ROLE db_datareader ADD MEMBER [NT SERVICE\MSSQLServerOLAPService];
> ```
> (o bien usar *Use a specific Windows user name and password* con su usuario de Windows).

📸 `02_data_source.png`

---

## 3. Vista del origen de datos (Data Source View)

1. Clic derecho en **Data Source Views → New Data Source View** → origen `AdventureWorksDW`.
2. Incluir estas tablas:

| Tabla | Rol |
|---|---|
| `FactInternetSales` | Hecho |
| `DimDate` | Dimensión Fecha |
| `DimProduct`, `DimProductSubcategory`, `DimProductCategory` | Dimensión Producto (copo de nieve) |
| `DimCustomer` | Dimensión Cliente |
| `DimSalesTerritory` | Dimensión Territorio |
| `DimPromotion` | Dimensión Promoción |

3. Nombre: `DSV AdventureWorks`. Verifique en el diagrama que existan las relaciones
   (las llaves foráneas se importan solas).

### 3.1 Cálculos con nombre (clic derecho en la tabla → *New Named Calculation*)

| Tabla | Nombre | Expresión |
|---|---|---|
| FactInternetSales | `Utilidad` | `SalesAmount - TotalProductCost` |
| DimCustomer | `NombreCompleto` | `FirstName + ' ' + LastName` |
| DimCustomer | `Genero` | `CASE Gender WHEN 'M' THEN 'Masculino' ELSE 'Femenino' END` |
| DimCustomer | `EstadoCivil` | `CASE MaritalStatus WHEN 'M' THEN 'Casado' ELSE 'Soltero' END` |
| DimDate | `NombreTrimestre` | `'T' + CAST(CalendarQuarter AS varchar(1)) + ' ' + CAST(CalendarYear AS varchar(4))` |
| DimDate | `NombreMes` | `SpanishMonthName + ' ' + CAST(CalendarYear AS varchar(4))` |

📸 `03_dsv_diagrama.png`, `04_named_calculations.png`

---

## 4. Dimensiones

Para cada una: clic derecho en **Dimensions → New Dimension → Use an existing table**.

### 4.1 Fecha (`DimDate`)
- Llave: `DateKey`, nombre: `FullDateAlternateKey`.
- Atributos y propiedades:

| Atributo | KeyColumns | NameColumn |
|---|---|---|
| Fecha (llave) | `DateKey` | `FullDateAlternateKey` |
| Mes | `CalendarYear`, `MonthNumberOfYear` | `NombreMes` |
| Trimestre | `CalendarYear`, `CalendarQuarter` | `NombreTrimestre` |
| Anio | `CalendarYear` | `CalendarYear` |

- Jerarquía **Calendario**: Anio → Trimestre → Mes → Fecha.
- Pestaña *Attribute Relationships*: Fecha → Mes → Trimestre → Anio (tipo *Rigid*).
- Propiedad de la dimensión `Type = Time` (opcional: *Add Business Intelligence → Define dimension intelligence*).

### 4.2 Producto (`DimProduct` + subcategoría + categoría)
- Al crearla, marcar también `DimProductSubcategory` y `DimProductCategory` (*Related Tables*).

| Atributo | KeyColumns | NameColumn |
|---|---|---|
| Producto (llave) | `ProductKey` | `EnglishProductName` |
| Subcategoria | `ProductSubcategoryKey` | `SpanishProductSubcategoryName` |
| Categoria | `ProductCategoryKey` | `SpanishProductCategoryName` |
| Color | `Color` | `Color` |

- Jerarquía **Categorias**: Categoria → Subcategoria → Producto.
- Relaciones: Producto → Subcategoria → Categoria.

### 4.3 Cliente (`DimCustomer`)

| Atributo | Columna |
|---|---|
| Cliente (llave) | `CustomerKey` (Name: `NombreCompleto`) |
| Genero | `Genero` |
| Estado Civil | `EstadoCivil` |
| Educacion | `SpanishEducation` |
| Ingreso Anual | `YearlyIncome` |

### 4.4 Territorio (`DimSalesTerritory`)

| Atributo | Columna |
|---|---|
| Region (llave) | `SalesTerritoryKey` (Name: `SalesTerritoryRegion`) |
| Pais | `SalesTerritoryCountry` |
| Grupo | `SalesTerritoryGroup` |

- Jerarquía **Territorios**: Grupo → Pais → Region. Relaciones: Region → Pais → Grupo.

### 4.5 Promocion (`DimPromotion`)

| Atributo | Columna |
|---|---|
| Promocion (llave) | `PromotionKey` (Name: `SpanishPromotionName`) |
| Tipo Promocion | `SpanishPromotionType` |
| Descuento | `DiscountPct` |

📸 `05_dim_fecha.png`, `06_dim_producto.png`, `07_dim_cliente.png`, `08_dim_territorio.png`, `09_dim_promocion.png`
(una por dimensión, mostrando atributos y jerarquía)

---

## 5. Cubo

1. Clic derecho en **Cubes → New Cube → Use existing tables**.
2. Measure group table: `FactInternetSales`.
3. Medidas (renombrarlas en la pestaña *Cube Structure*):

| Medida | Columna | Agregación | Formato |
|---|---|---|---|
| Ventas | `SalesAmount` | Sum | `Currency` |
| Costo | `TotalProductCost` | Sum | `Currency` |
| Utilidad | `Utilidad` (cálculo con nombre) | Sum | `Currency` |
| Unidades | `OrderQuantity` | Sum | `#,##0` |
| Ordenes | `SalesOrderNumber` | DistinctCount | `#,##0` |

> *Ordenes* (DistinctCount) se crea con *New Measure* y Visual Studio la coloca en su propio grupo de medidas; es lo esperado.

4. Dimensiones: Fecha, Producto, Cliente, Territorio, Promocion. Nombre del cubo: **Ventas Internet**.
5. Pestaña *Dimension Usage*: `DimDate` aparece tres veces (OrderDate, DueDate, ShipDate).
   Deje solo la relacionada por **OrderDateKey** y llámela `Fecha` (elimine las otras o renómbrelas).
6. Pestaña *Calculations → New Calculated Member*:

```mdx
CREATE MEMBER CURRENTCUBE.[Measures].[Margen Pct]
 AS IIF([Measures].[Ventas] = 0, NULL, [Measures].[Utilidad] / [Measures].[Ventas]),
FORMAT_STRING = "Percent", VISIBLE = 1;
```

📸 `10_cube_structure.png`, `11_dimension_usage.png`, `12_calculations.png`

---

## 6. Desplegar y procesar

1. Clic derecho en el proyecto → *Properties → Deployment → Server*: `localhost` (instancia SSAS).
2. Clic derecho en el proyecto → **Deploy**. Debe terminar con *Deploy Succeeded*.
3. Ventana *Process Progress*: *Process succeeded*.

📸 `13_deploy_succeeded.png`, `14_process_progress.png`

---

## 7. Exploración y validación

1. Pestaña **Browser** del cubo: arrastre `Ventas`, `Utilidad` y la jerarquía `Fecha.Calendario`.
2. En SSMS (*Connect → Analysis Services*) ejecute `olap/consultas_cubo.mdx`.
3. Compare con `sql/03_problemas_negocio.sql`: los totales deben coincidir
   (por ejemplo, Ventas por año del Problema 1).

📸 `15_browser_cubo.png`, `16_mdx_problema1.png` … `21_mdx_problema6.png`, `22_comparacion_sql_vs_cubo.png`

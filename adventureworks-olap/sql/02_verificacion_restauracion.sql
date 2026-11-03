-- =====================================================================
-- Desafío Práctico 2 - Paso 2: Verificación y exploración de la base
-- =====================================================================
USE AdventureWorksDW2022;
GO

-- 2.1 Estado de la base restaurada
SELECT name, state_desc, recovery_model_desc, compatibility_level, create_date
FROM sys.databases
WHERE name = DB_NAME();
GO

-- 2.2 Inventario de tablas de hechos y dimensiones con su número de filas
SELECT
    s.name                                   AS Esquema,
    t.name                                   AS Tabla,
    CASE WHEN t.name LIKE 'Fact%' THEN 'Hecho'
         WHEN t.name LIKE 'Dim%'  THEN 'Dimensión'
         ELSE 'Otra' END                     AS Tipo,
    SUM(p.rows)                              AS Filas
FROM sys.tables t
JOIN sys.schemas s    ON s.schema_id = t.schema_id
JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
GROUP BY s.name, t.name
ORDER BY Tipo DESC, Filas DESC;
GO

-- 2.3 Relaciones (llaves foráneas) de la tabla de hechos principal
SELECT
    fk.name                                         AS LlaveForanea,
    OBJECT_NAME(fk.parent_object_id)                AS TablaHechos,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id)          AS Columna,
    OBJECT_NAME(fk.referenced_object_id)            AS Dimension,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id)  AS ColumnaDimension
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
WHERE OBJECT_NAME(fk.parent_object_id) = 'FactInternetSales'
ORDER BY Dimension;
GO

-- 2.4 Rango de fechas disponible en las ventas por Internet
SELECT MIN(OrderDate) AS PrimeraVenta,
       MAX(OrderDate) AS UltimaVenta,
       COUNT(DISTINCT SalesOrderNumber) AS Ordenes,
       COUNT(*)                         AS LineasDeVenta
FROM dbo.FactInternetSales;
GO

-- 2.5 Calidad de datos: valores nulos en columnas clave del hecho
SELECT
    SUM(CASE WHEN ProductKey        IS NULL THEN 1 ELSE 0 END) AS NulosProducto,
    SUM(CASE WHEN CustomerKey       IS NULL THEN 1 ELSE 0 END) AS NulosCliente,
    SUM(CASE WHEN OrderDateKey      IS NULL THEN 1 ELSE 0 END) AS NulosFecha,
    SUM(CASE WHEN SalesTerritoryKey IS NULL THEN 1 ELSE 0 END) AS NulosTerritorio,
    SUM(CASE WHEN SalesAmount       IS NULL THEN 1 ELSE 0 END) AS NulosMonto
FROM dbo.FactInternetSales;
GO

-- 2.6 Muestra de datos
SELECT TOP (10) * FROM dbo.FactInternetSales ORDER BY OrderDate DESC;
GO

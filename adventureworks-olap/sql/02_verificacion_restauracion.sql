USE AdventureWorksDW2022;
GO

SELECT name, state_desc, recovery_model_desc, compatibility_level, create_date
FROM sys.databases
WHERE name = DB_NAME();
GO

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
ORDER BY CASE WHEN t.name LIKE 'Fact%' THEN 1
              WHEN t.name LIKE 'Dim%'  THEN 2
              ELSE 3 END,
         Filas DESC;
GO

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

SELECT MIN(OrderDate) AS PrimeraVenta,
       MAX(OrderDate) AS UltimaVenta,
       COUNT(DISTINCT SalesOrderNumber) AS Ordenes,
       COUNT(*)                         AS LineasDeVenta
FROM dbo.FactInternetSales;
GO

SELECT
    SUM(CASE WHEN ProductKey        IS NULL THEN 1 ELSE 0 END) AS NulosProducto,
    SUM(CASE WHEN CustomerKey       IS NULL THEN 1 ELSE 0 END) AS NulosCliente,
    SUM(CASE WHEN OrderDateKey      IS NULL THEN 1 ELSE 0 END) AS NulosFecha,
    SUM(CASE WHEN SalesTerritoryKey IS NULL THEN 1 ELSE 0 END) AS NulosTerritorio,
    SUM(CASE WHEN SalesAmount       IS NULL THEN 1 ELSE 0 END) AS NulosMonto
FROM dbo.FactInternetSales;
GO

SELECT TOP (10) * FROM dbo.FactInternetSales ORDER BY OrderDate DESC;
GO

-- =====================================================================
-- Desafío Práctico 2 - Paso 3: Consultas SQL para los problemas de negocio
-- Base: AdventureWorksDW2022   Hecho principal: dbo.FactInternetSales
--
-- Métricas utilizadas en todo el desafío (las mismas que tendrá el cubo):
--   Ventas    = SUM(SalesAmount)
--   Costo     = SUM(TotalProductCost)
--   Utilidad  = SUM(SalesAmount - TotalProductCost)
--   Margen %  = Utilidad / Ventas
--   Unidades  = SUM(OrderQuantity)
--   Órdenes   = COUNT(DISTINCT SalesOrderNumber)
--
-- Criterios de optimización aplicados:
--   * Se une por las llaves sustitutas (int) que ya están indexadas.
--   * Se agrega primero en el hecho y luego se une a dimensiones (CTE).
--   * Se seleccionan solo las columnas necesarias (sin SELECT *).
--   * NULLIF evita divisiones entre cero.
-- =====================================================================
USE AdventureWorksDW2022;
GO
SET STATISTICS IO, TIME ON;   -- evidencia de rendimiento (pestaña Messages)
GO

-- ---------------------------------------------------------------------
-- Problema 1: ¿Cómo evolucionan las ventas y la utilidad por año y
-- trimestre? ¿Qué porcentaje de crecimiento hubo respecto al año anterior?
-- ---------------------------------------------------------------------
WITH VentasAnuales AS (
    SELECT d.CalendarYear                              AS Anio,
           SUM(f.SalesAmount)                          AS Ventas,
           SUM(f.SalesAmount - f.TotalProductCost)     AS Utilidad
    FROM dbo.FactInternetSales f
    JOIN dbo.DimDate d ON d.DateKey = f.OrderDateKey
    GROUP BY d.CalendarYear
)
SELECT Anio,
       CAST(Ventas   AS DECIMAL(18,2)) AS Ventas,
       CAST(Utilidad AS DECIMAL(18,2)) AS Utilidad,
       CAST(100.0 * (Ventas - LAG(Ventas) OVER (ORDER BY Anio))
            / NULLIF(LAG(Ventas) OVER (ORDER BY Anio), 0) AS DECIMAL(9,2)) AS CrecimientoPct
FROM VentasAnuales
ORDER BY Anio;
GO

-- Detalle por trimestre
SELECT d.CalendarYear                                          AS Anio,
       d.CalendarQuarter                                       AS Trimestre,
       CAST(SUM(f.SalesAmount) AS DECIMAL(18,2))               AS Ventas,
       CAST(SUM(f.SalesAmount - f.TotalProductCost) AS DECIMAL(18,2)) AS Utilidad
FROM dbo.FactInternetSales f
JOIN dbo.DimDate d ON d.DateKey = f.OrderDateKey
GROUP BY d.CalendarYear, d.CalendarQuarter
ORDER BY Anio, Trimestre;
GO

-- ---------------------------------------------------------------------
-- Problema 2: ¿Qué categorías y subcategorías de producto generan más
-- ingresos y cuál es su margen de utilidad?
-- ---------------------------------------------------------------------
SELECT pc.SpanishProductCategoryName                                   AS Categoria,
       ps.SpanishProductSubcategoryName                                AS Subcategoria,
       SUM(f.OrderQuantity)                                            AS Unidades,
       CAST(SUM(f.SalesAmount) AS DECIMAL(18,2))                       AS Ventas,
       CAST(SUM(f.SalesAmount - f.TotalProductCost) AS DECIMAL(18,2))  AS Utilidad,
       CAST(100.0 * SUM(f.SalesAmount - f.TotalProductCost)
            / NULLIF(SUM(f.SalesAmount), 0) AS DECIMAL(9,2))           AS MargenPct
FROM dbo.FactInternetSales f
JOIN dbo.DimProduct p             ON p.ProductKey = f.ProductKey
JOIN dbo.DimProductSubcategory ps ON ps.ProductSubcategoryKey = p.ProductSubcategoryKey
JOIN dbo.DimProductCategory pc    ON pc.ProductCategoryKey = ps.ProductCategoryKey
GROUP BY pc.SpanishProductCategoryName, ps.SpanishProductSubcategoryName
ORDER BY Ventas DESC;
GO

-- ---------------------------------------------------------------------
-- Problema 3: ¿Cuáles son los 10 productos más rentables?
-- ---------------------------------------------------------------------
WITH UtilidadProducto AS (
    SELECT f.ProductKey,
           SUM(f.OrderQuantity)                      AS Unidades,
           SUM(f.SalesAmount)                        AS Ventas,
           SUM(f.SalesAmount - f.TotalProductCost)   AS Utilidad
    FROM dbo.FactInternetSales f
    GROUP BY f.ProductKey
)
SELECT TOP (10)
       p.EnglishProductName                     AS Producto,
       u.Unidades,
       CAST(u.Ventas   AS DECIMAL(18,2))        AS Ventas,
       CAST(u.Utilidad AS DECIMAL(18,2))        AS Utilidad,
       RANK() OVER (ORDER BY u.Utilidad DESC)   AS Ranking
FROM UtilidadProducto u
JOIN dbo.DimProduct p ON p.ProductKey = u.ProductKey
ORDER BY u.Utilidad DESC;
GO

-- ---------------------------------------------------------------------
-- Problema 4: ¿En qué regiones y países se concentran las ventas?
-- ---------------------------------------------------------------------
SELECT st.SalesTerritoryGroup                                         AS Grupo,
       st.SalesTerritoryCountry                                       AS Pais,
       st.SalesTerritoryRegion                                        AS Region,
       COUNT(DISTINCT f.SalesOrderNumber)                             AS Ordenes,
       CAST(SUM(f.SalesAmount) AS DECIMAL(18,2))                      AS Ventas,
       CAST(100.0 * SUM(f.SalesAmount)
            / SUM(SUM(f.SalesAmount)) OVER () AS DECIMAL(9,2))        AS ParticipacionPct
FROM dbo.FactInternetSales f
JOIN dbo.DimSalesTerritory st ON st.SalesTerritoryKey = f.SalesTerritoryKey
GROUP BY st.SalesTerritoryGroup, st.SalesTerritoryCountry, st.SalesTerritoryRegion
ORDER BY Ventas DESC;
GO

-- ---------------------------------------------------------------------
-- Problema 5: ¿Cuál es el perfil del cliente que más compra?
-- (género, estado civil, nivel educativo y rango de edad)
-- ---------------------------------------------------------------------
WITH VentasCliente AS (
    SELECT c.CustomerKey,
           CASE c.Gender        WHEN 'M' THEN 'Masculino' ELSE 'Femenino' END AS Genero,
           CASE c.MaritalStatus WHEN 'M' THEN 'Casado'    ELSE 'Soltero'  END AS EstadoCivil,
           c.SpanishEducation                                                 AS Educacion,
           DATEDIFF(YEAR, c.BirthDate, f.OrderDate)                           AS EdadCompra,
           f.SalesAmount
    FROM dbo.FactInternetSales f
    JOIN dbo.DimCustomer c ON c.CustomerKey = f.CustomerKey
)
SELECT Genero,
       EstadoCivil,
       Educacion,
       CASE WHEN EdadCompra < 30 THEN '1. Menor de 30'
            WHEN EdadCompra < 45 THEN '2. 30 a 44'
            WHEN EdadCompra < 60 THEN '3. 45 a 59'
            ELSE '4. 60 o más' END                     AS RangoEdad,
       COUNT(DISTINCT CustomerKey)                     AS Clientes,
       CAST(SUM(SalesAmount) AS DECIMAL(18,2))         AS Ventas,
       CAST(SUM(SalesAmount) / NULLIF(COUNT(DISTINCT CustomerKey), 0) AS DECIMAL(18,2)) AS VentaPromedioCliente
FROM VentasCliente
GROUP BY Genero, EstadoCivil, Educacion,
         CASE WHEN EdadCompra < 30 THEN '1. Menor de 30'
              WHEN EdadCompra < 45 THEN '2. 30 a 44'
              WHEN EdadCompra < 60 THEN '3. 45 a 59'
              ELSE '4. 60 o más' END
ORDER BY Ventas DESC;
GO

-- ---------------------------------------------------------------------
-- Problema 6: ¿Qué impacto tienen las promociones en las ventas?
-- ---------------------------------------------------------------------
SELECT pr.SpanishPromotionName                                       AS Promocion,
       pr.SpanishPromotionType                                       AS TipoPromocion,
       CAST(pr.DiscountPct * 100 AS DECIMAL(5,2))                    AS DescuentoPct,
       COUNT(DISTINCT f.SalesOrderNumber)                            AS Ordenes,
       SUM(f.OrderQuantity)                                          AS Unidades,
       CAST(SUM(f.SalesAmount) AS DECIMAL(18,2))                     AS Ventas,
       CAST(SUM(f.SalesAmount - f.TotalProductCost) AS DECIMAL(18,2)) AS Utilidad
FROM dbo.FactInternetSales f
JOIN dbo.DimPromotion pr ON pr.PromotionKey = f.PromotionKey
GROUP BY pr.SpanishPromotionName, pr.SpanishPromotionType, pr.DiscountPct
ORDER BY Ventas DESC;
GO

SET STATISTICS IO, TIME OFF;
GO

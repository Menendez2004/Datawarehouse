-- =====================================================================
-- Desafio Practico 1 - Preguntas de Negocio
-- =====================================================================

-- ---------------------------------------------------------------------
-- Pregunta 1:
-- Cual es la categoria y subcategoria de productos que genera el mayor
-- volumen de ingresos (ventas totales) para la empresa?
-- ---------------------------------------------------------------------
SELECT
    c.category_name,
    sc.subcategory_name,
    ROUND(SUM(oi.sales), 2) AS ventas_totales
FROM order_items oi
JOIN products p       ON p.product_id = oi.product_id
JOIN subcategories sc ON sc.subcategory_id = p.subcategory_id
JOIN categories c     ON c.category_id = sc.category_id
GROUP BY c.category_name, sc.subcategory_name
ORDER BY ventas_totales DESC
LIMIT 1;


-- ---------------------------------------------------------------------
-- Pregunta 2:
-- Quienes son los cinco clientes que han generado la mayor rentabilidad
-- en la historia de la tienda?
--
-- NOTA (limitacion de datos): el dataset fuente (train.csv) no incluye
-- una columna de costo/utilidad (Profit), unicamente Sales. Por lo tanto,
-- se utiliza el total de Sales (ingresos) como metrica proxy de
-- "rentabilidad" para esta consulta, segun lo acordado con el usuario.
-- ---------------------------------------------------------------------
SELECT
    c.customer_id,
    c.customer_name,
    ROUND(SUM(oi.sales), 2) AS ventas_totales
FROM order_items oi
JOIN orders o     ON o.order_id = oi.order_id
JOIN customers c  ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name
ORDER BY ventas_totales DESC
LIMIT 5;


-- ---------------------------------------------------------------------
-- Pregunta 3:
-- Cual fue el mes que registro la mayor cantidad de ordenes realizadas y
-- cual fue el mes con menos ordenes?
--
-- Se agrupa por mes del calendario (Enero..Diciembre), sumando las
-- ordenes de ese mes a traves de los 4 anios del dataset (2015-2018),
-- ya que la pregunta pide "el mes", no "el mes-anio" especifico.
-- ---------------------------------------------------------------------
WITH ordenes_por_mes AS (
    SELECT
        EXTRACT(MONTH FROM order_date)::int AS mes_numero,
        TO_CHAR(order_date, 'Month') AS mes_nombre,
        COUNT(*) AS cantidad_ordenes
    FROM orders
    GROUP BY EXTRACT(MONTH FROM order_date), TO_CHAR(order_date, 'Month')
)
SELECT * FROM (
    (SELECT 'Mayor cantidad' AS tipo, mes_numero, TRIM(mes_nombre) AS mes_nombre, cantidad_ordenes
     FROM ordenes_por_mes ORDER BY cantidad_ordenes DESC LIMIT 1)
    UNION ALL
    (SELECT 'Menor cantidad' AS tipo, mes_numero, TRIM(mes_nombre) AS mes_nombre, cantidad_ordenes
     FROM ordenes_por_mes ORDER BY cantidad_ordenes ASC LIMIT 1)
) resultado
ORDER BY tipo DESC;

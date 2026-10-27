-- Datawarehouse Global Electronic Retail — Esquema estrella (PostgreSQL)
-- Grano de la tabla de hechos: una línea de pedido (Primary ID del Excel).

BEGIN;

DROP SCHEMA IF EXISTS dw CASCADE;
CREATE SCHEMA dw;

CREATE TABLE dw.dim_fecha (
    fecha_key      INTEGER PRIMARY KEY,          -- formato AAAAMMDD
    fecha          DATE NOT NULL UNIQUE,
    dia            SMALLINT NOT NULL,
    mes            SMALLINT NOT NULL,
    nombre_mes     TEXT NOT NULL,
    trimestre      SMALLINT NOT NULL,
    anio           SMALLINT NOT NULL,
    dia_semana     SMALLINT NOT NULL,            -- 1 = lunes … 7 = domingo
    nombre_dia     TEXT NOT NULL,
    es_fin_semana  BOOLEAN NOT NULL
);

CREATE TABLE dw.dim_cliente (
    cliente_key    SERIAL PRIMARY KEY,
    customer_id    TEXT NOT NULL UNIQUE,         -- clave natural del Excel
    nombre_cliente TEXT NOT NULL,
    segmento       TEXT NOT NULL,                -- Consumer / Corporate
    cluster_kmeans SMALLINT                      -- se llena en la Fase 2 (K-means)
);

CREATE TABLE dw.dim_producto (
    producto_key   SERIAL PRIMARY KEY,
    product_id     TEXT NOT NULL UNIQUE,
    nombre_producto TEXT NOT NULL,
    subcategoria   TEXT NOT NULL,
    categoria      TEXT NOT NULL
);

CREATE TABLE dw.dim_geografia (
    geografia_key  SERIAL PRIMARY KEY,
    ciudad         TEXT NOT NULL,
    estado         TEXT NOT NULL,
    pais           TEXT NOT NULL,
    iso3           CHAR(3) NOT NULL,
    region         TEXT NOT NULL,
    mercado        TEXT NOT NULL,
    latitud        NUMERIC(9, 6) NOT NULL,
    longitud       NUMERIC(9, 6) NOT NULL,
    UNIQUE (ciudad, estado, pais)
);

CREATE TABLE dw.dim_modo_envio (
    modo_envio_key SERIAL PRIMARY KEY,
    modo_envio     TEXT NOT NULL UNIQUE          -- Basic / Standard / Express / Prime
);

CREATE TABLE dw.fact_ventas (
    venta_key            BIGSERIAL PRIMARY KEY,
    primary_id           INTEGER NOT NULL UNIQUE,     -- trazabilidad con el Excel
    order_id             INTEGER NOT NULL,            -- dimensión degenerada
    fecha_pedido_key     INTEGER NOT NULL REFERENCES dw.dim_fecha(fecha_key),
    fecha_envio_key      INTEGER NOT NULL REFERENCES dw.dim_fecha(fecha_key),
    cliente_key          INTEGER NOT NULL REFERENCES dw.dim_cliente(cliente_key),
    producto_key         INTEGER NOT NULL REFERENCES dw.dim_producto(producto_key),
    geografia_key        INTEGER NOT NULL REFERENCES dw.dim_geografia(geografia_key),
    modo_envio_key       INTEGER NOT NULL REFERENCES dw.dim_modo_envio(modo_envio_key),
    cantidad             SMALLINT NOT NULL CHECK (cantidad > 0),
    descuento            NUMERIC(4, 2) NOT NULL CHECK (descuento BETWEEN 0 AND 1),
    ventas               NUMERIC(12, 2) NOT NULL CHECK (ventas >= 0),
    costo_envio          NUMERIC(12, 2) NOT NULL,
    costo_almacenamiento NUMERIC(12, 2) NOT NULL,
    costo_personal       NUMERIC(12, 2) NOT NULL,
    costo_venta          NUMERIC(12, 2) NOT NULL,
    costo_compra         NUMERIC(12, 2) NOT NULL,
    costo_total          NUMERIC(12, 2) NOT NULL,
    utilidad             NUMERIC(12, 2) NOT NULL,
    dias_envio           SMALLINT NOT NULL,
    fecha_inconsistente  BOOLEAN NOT NULL DEFAULT FALSE  -- envío anterior al pedido en el origen
);

CREATE INDEX idx_fv_fecha_pedido ON dw.fact_ventas(fecha_pedido_key);
CREATE INDEX idx_fv_cliente      ON dw.fact_ventas(cliente_key);
CREATE INDEX idx_fv_producto     ON dw.fact_ventas(producto_key);
CREATE INDEX idx_fv_geografia    ON dw.fact_ventas(geografia_key);
CREATE INDEX idx_fv_modo_envio   ON dw.fact_ventas(modo_envio_key);
CREATE INDEX idx_fv_order_id     ON dw.fact_ventas(order_id);

COMMIT;

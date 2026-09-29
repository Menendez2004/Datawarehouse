BEGIN;

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS ship_modes CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS states CASCADE;
DROP TABLE IF EXISTS regions CASCADE;

CREATE TABLE regions (
    region_id SERIAL PRIMARY KEY,
    region_name TEXT NOT NULL UNIQUE
);

CREATE TABLE states (
    state_id SERIAL PRIMARY KEY,
    state_name TEXT NOT NULL UNIQUE,
    region_id INTEGER NOT NULL REFERENCES regions(region_id)
);
CREATE INDEX idx_states_region_id ON states(region_id);

CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    state_id INTEGER NOT NULL REFERENCES states(state_id),
    postal_code CHAR(5) NOT NULL,
    country TEXT NOT NULL,
    UNIQUE (city, state_id, postal_code)
);
CREATE INDEX idx_locations_state_id ON locations(state_id);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name TEXT NOT NULL UNIQUE
);

CREATE TABLE subcategories (
    subcategory_id SERIAL PRIMARY KEY,
    subcategory_name TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL REFERENCES categories(category_id)
);
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);

CREATE TABLE products (
    product_id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    subcategory_id INTEGER NOT NULL REFERENCES subcategories(subcategory_id)
);
CREATE INDEX idx_products_subcategory_id ON products(subcategory_id);

CREATE TABLE ship_modes (
    ship_mode_id SERIAL PRIMARY KEY,
    ship_mode_name TEXT NOT NULL UNIQUE
);

CREATE TABLE customers (
    customer_id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    segment TEXT NOT NULL
);

CREATE TABLE orders (
    order_id TEXT PRIMARY KEY,
    order_date DATE NOT NULL,
    ship_date DATE NOT NULL,
    ship_mode_id INTEGER NOT NULL REFERENCES ship_modes(ship_mode_id),
    customer_id TEXT NOT NULL REFERENCES customers(customer_id),
    location_id INTEGER NOT NULL REFERENCES locations(location_id),
    CONSTRAINT chk_ship_after_order CHECK (ship_date >= order_date)
);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_location_id ON orders(location_id);
CREATE INDEX idx_orders_ship_mode_id ON orders(ship_mode_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);

CREATE TABLE order_items (
    row_id INTEGER PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(order_id),
    product_id TEXT NOT NULL REFERENCES products(product_id),
    sales NUMERIC(12, 2) NOT NULL CHECK (sales >= 0)
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

COMMIT;
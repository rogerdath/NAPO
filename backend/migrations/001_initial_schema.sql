-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    record_id BIGINT NOT NULL,
    changed_data JSONB,
    changed_by TEXT,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    bounds JSONB NOT NULL,
    color VARCHAR NOT NULL,
    zipcodes JSONB,
    properties JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Optimization tables
CREATE TABLE IF NOT EXISTS o_zones (
    id BIGSERIAL PRIMARY KEY,
    zone_name TEXT NOT NULL,
    postal_codes TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    last_updated_by TEXT
);

CREATE TABLE IF NOT EXISTS o_nodes (
    id BIGSERIAL PRIMARY KEY,
    node_name TEXT NOT NULL,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    last_updated_by TEXT
);

CREATE TABLE IF NOT EXISTS o_time_windows (
    id BIGSERIAL PRIMARY KEY,
    node_id BIGINT REFERENCES o_nodes(id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    last_updated_by TEXT
);

CREATE TABLE IF NOT EXISTS o_distance_matrix (
    id BIGSERIAL PRIMARY KEY,
    origin_node_id BIGINT REFERENCES o_nodes(id),
    destination_node_id BIGINT REFERENCES o_nodes(id),
    distance NUMERIC NOT NULL,
    travel_time NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    last_updated_by TEXT
);

-- Transport tables
CREATE TABLE IF NOT EXISTS t_routes (
    id BIGSERIAL PRIMARY KEY,
    route_name TEXT NOT NULL,
    description TEXT,
    zone_id BIGINT REFERENCES o_zones(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    last_updated_by TEXT
);

CREATE TABLE IF NOT EXISTS t_vehicles (
    id BIGSERIAL PRIMARY KEY,
    vehicle_name TEXT NOT NULL,
    capacity NUMERIC,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    last_updated_by TEXT
);

CREATE TABLE IF NOT EXISTS t_transporters (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    base_latitude DOUBLE PRECISION,
    base_longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    last_updated_by TEXT
);

CREATE TABLE IF NOT EXISTS t_vehicle_assignments (
    id BIGSERIAL PRIMARY KEY,
    route_id BIGINT REFERENCES t_routes(id),
    vehicle_id BIGINT REFERENCES t_vehicles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    last_updated_by TEXT
);

-- Pricing tables
CREATE TABLE IF NOT EXISTS p_pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    last_updated_by TEXT
);

CREATE TABLE IF NOT EXISTS p_start_fees (
    id BIGSERIAL PRIMARY KEY,
    pricing_rule_id BIGINT REFERENCES p_pricing_rules(id),
    location_type TEXT NOT NULL,
    max_fee NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    last_updated_by TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nodes_location ON o_nodes USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_zones_name ON o_zones(zone_name);
CREATE INDEX IF NOT EXISTS idx_routes_name ON t_routes(route_name);
CREATE INDEX IF NOT EXISTS idx_vehicles_name ON t_vehicles(vehicle_name);
CREATE INDEX IF NOT EXISTS idx_audit_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record_id ON audit_log(record_id); 
-- Add zone_id to t_transporters
ALTER TABLE t_transporters
ADD COLUMN zone_id BIGINT REFERENCES o_zones(id);

-- Add transporter_id to t_vehicles
ALTER TABLE t_vehicles
ADD COLUMN transporter_id BIGINT REFERENCES t_transporters(id);

-- Add indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_transporters_zone ON t_transporters(zone_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_transporter ON t_vehicles(transporter_id);

-- Insert test data
INSERT INTO o_zones (zone_name, postal_codes) 
VALUES ('Oslo Sentrum', ARRAY['0150', '0151', '0152', '0153', '0154', '0155']);

INSERT INTO t_transporters (name, base_latitude, base_longitude, zone_id) 
VALUES ('Oslo Taxi Transport AS', 59.913868, 10.752245, 
        (SELECT id FROM o_zones WHERE zone_name = 'Oslo Sentrum'));

INSERT INTO t_vehicles (vehicle_name, capacity, transporter_id)
VALUES 
    ('OT-001', 4, (SELECT id FROM t_transporters WHERE name = 'Oslo Taxi Transport AS')),
    ('OT-002', 4, (SELECT id FROM t_transporters WHERE name = 'Oslo Taxi Transport AS')),
    ('OT-003', 8, (SELECT id FROM t_transporters WHERE name = 'Oslo Taxi Transport AS')); 
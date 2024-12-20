# Database Schema

## Table Overview

### Optimization Tables (o_*)
- `o_zones`: Geographic zones for transport planning
- `o_nodes`: Network nodes with spatial data (PostGIS)
- `o_time_windows`: Time windows for operations
- `o_distance_matrix`: Distance and travel time between nodes

### Transport Tables (t_*)
- `t_routes`: Transport routes
- `t_vehicles`: Vehicle information (linked to transporters)
- `t_transporters`: Transporter information (linked to zones)
- `t_vehicle_assignments`: Route-vehicle assignments

### Pricing Tables (p_*)
- `p_pricing_rules`: General pricing rules
- `p_start_fees`: Location-based start fees

### Other Tables
- `districts`: District information
- `audit_log`: Change tracking
- `spatial_ref_sys`: PostGIS spatial reference system

## Detailed Schema

### o_zones
Stores zones for transport planning. Requires PostGIS extension.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | bigint | NO | Primary key |
| zone_name | text | NO | Name of the zone |
| postal_codes | ARRAY | YES | Array of postal codes |
| created_at | timestamp with time zone | YES | Creation timestamp |
| updated_at | timestamp with time zone | YES | Last update timestamp |
| created_by | text | YES | Creator identifier |
| last_updated_by | text | YES | Last updater identifier |

### t_transporters
Stores transporter information and their base locations.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | bigint | NO | Primary key |
| name | text | NO | Transporter name |
| base_latitude | double precision | YES | Base location latitude |
| base_longitude | double precision | YES | Base location longitude |
| zone_id | bigint | YES | Reference to operating zone |
| created_at | timestamp with time zone | YES | Creation timestamp |
| updated_at | timestamp with time zone | YES | Last update timestamp |
| created_by | text | YES | Creator identifier |
| last_updated_by | text | YES | Last updater identifier |

### t_vehicles
Stores vehicle information.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | bigint | NO | Primary key |
| vehicle_name | text | NO | Vehicle identifier |
| capacity | numeric | YES | Vehicle capacity |
| transporter_id | bigint | YES | Reference to transporter |
| created_at | timestamp with time zone | YES | Creation timestamp |
| updated_at | timestamp with time zone | YES | Last update timestamp |
| created_by | text | YES | Creator identifier |
| last_updated_by | text | YES | Last updater identifier |

[Additional tables follow same format...]

## Relationships

1. Zone-based Organization
   - `o_zones` ← `t_transporters` (zone_id)
   - Zones define operational areas for transporters

2. Transporter Management
   - `t_transporters` ← `t_vehicles` (transporter_id)
   - Transporters own and manage multiple vehicles

3. Vehicle Operations
   - `t_vehicles` ← `t_vehicle_assignments` → `t_routes`
   - Vehicles are assigned to specific routes

4. Network Structure
   - `o_nodes` referenced in `o_distance_matrix`
   - Nodes form the basis of the transport network

## Audit Trail
All tables include:
- Creation tracking (created_at, created_by)
- Update tracking (updated_at, last_updated_by)
- Changes logged in audit_log table
-- 006_create_indexes.sql
-- Optimizing indexes for station autocomplete, between-station train search, and running days

-- Indexes for station searches
CREATE INDEX idx_stations_code ON stations(station_code);
CREATE INDEX idx_stations_name ON stations(station_name);
CREATE INDEX idx_stations_city ON stations(city);

-- Indexes for train search
CREATE INDEX idx_trains_number ON trains(train_number);
CREATE INDEX idx_trains_name ON trains(train_name);
CREATE INDEX idx_trains_type ON trains(train_type);

-- Indexes for route sequence and between-station graph lookups
CREATE INDEX idx_routes_station_train ON train_routes(station_id, train_id, stop_sequence);
CREATE INDEX idx_routes_train_sequence ON train_routes(train_id, stop_sequence);

-- Indexes for day filtering
CREATE INDEX idx_running_days_day ON train_running_days(day_of_week, train_id);

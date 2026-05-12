DROP TABLE IF EXISTS farmers;
CREATE TABLE farmers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parcel_id REAL,
    grouping TEXT,
    nzc_field_id TEXT,
    farmer_name TEXT,
    activity_area REAL,
    status TEXT,
    planting INTEGER DEFAULT 0,
    dry_1 INTEGER DEFAULT 0,
    wet_1 INTEGER DEFAULT 0,
    harvest INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farmers_grouping ON farmers(grouping);
CREATE INDEX idx_farmers_name ON farmers(farmer_name);

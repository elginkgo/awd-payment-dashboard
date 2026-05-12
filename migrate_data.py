import pandas as pd
import sqlite3

excel_file = '../AWD_DATABASE_CONFIG.xlsx'
output_sql = 'seed_data.sql'

print(f"Reading {excel_file}...")
df = pd.read_excel(excel_file, sheet_name='all')

# Handle NaN values
df = df.fillna('')

with open(output_sql, 'w', encoding='utf-8') as f:
    f.write("-- Seed data from Excel\n")
    for index, row in df.iterrows():
        # Escape single quotes in names
        farmer_name = str(row['FARMER_NAME']).replace("'", "''")
        nzc_id = str(row['NZC_FIELD_ID']).replace("'", "''")
        grouping = str(row['GROUPING']).replace("'", "''")
        status = str(row['STATUS']).replace("'", "''")
        parcel_id = row['PARCEL_ID'] if row['PARCEL_ID'] != '' else 0
        area = row['ACTIVITY_AREA'] if row['ACTIVITY_AREA'] != '' else 0

        sql = f"INSERT INTO farmers (parcel_id, grouping, nzc_field_id, farmer_name, activity_area, status) VALUES ({parcel_id}, '{grouping}', '{nzc_id}', '{farmer_name}', {area}, '{status}');\n"
        f.write(sql)

print(f"Created {output_sql} with {len(df)} records.")

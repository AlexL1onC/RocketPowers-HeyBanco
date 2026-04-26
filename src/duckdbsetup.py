import duckdb
# crear base de datos
con = duckdb.connect("havi.duckdb")

# cargar datos
con.execute("CREATE OR REPLACE TABLE clientes AS SELECT * FROM read_csv_auto('data/hey_clientes.csv')")
con.execute("CREATE OR REPLACE TABLE productos AS SELECT * FROM read_csv_auto('data/hey_productos.csv')")
con.execute("CREATE OR REPLACE TABLE transacciones AS SELECT * FROM read_csv_auto('data/hey_transacciones.csv')")
con.execute("CREATE OR REPLACE TABLE conversaciones AS SELECT * FROM read_parquet('data/dataset_50k_anonymized.parquet')")


# verificar
print("Tablas creadas:")
print(con.execute("SHOW TABLES").fetchall())

con.close()



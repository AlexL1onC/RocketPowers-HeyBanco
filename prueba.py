import duckdb

con = duckdb.connect("havi.duckdb")

print(con.execute("SELECT COUNT(*) FROM transacciones").fetchall())

print(con.execute("""
SELECT user_id, SUM(monto) as gasto_total
FROM transacciones
GROUP BY user_id
ORDER BY gasto_total DESC
LIMIT 5
""").fetchdf())

con.close()
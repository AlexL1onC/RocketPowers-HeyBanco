import duckdb
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import warnings

warnings.filterwarnings('ignore')

# 1. CONEXIÓN Y EXTRACCIÓN
con = duckdb.connect("havi.duckdb")

query = """
    SELECT 
        c.user_id,
        COALESCE(c.ingreso_mensual_mxn, 1) AS ingresos,
        GREATEST(c.antiguedad_dias, 1) AS antiguedad_dias,
        COALESCE(t.gasto_total, 0) AS gasto_total_historico,
        COALESCE(p.deuda_total, 0) AS deuda,
        COALESCE(p.limite_total, 1) AS limite
    FROM clientes c
    LEFT JOIN (
        SELECT user_id, SUM(monto) AS gasto_total FROM transacciones GROUP BY user_id
    ) t ON c.user_id = t.user_id
    LEFT JOIN (
        SELECT user_id, 
               SUM(CASE WHEN tipo_producto LIKE '%credito%' THEN saldo_actual ELSE 0 END) AS deuda_total,
               SUM(limite_credito) AS limite_total
        FROM productos GROUP BY user_id
    ) p ON c.user_id = p.user_id
"""
df = con.execute(query).fetchdf()

# 2. FEATURE ENGINEERING (Ratios Reales)
df['meses_activo'] = df['antiguedad_dias'] / 30.0
df['gasto_mensual_est'] = df['gasto_total_historico'] / df['meses_activo']
df['proporcion_gasto_ingreso'] = df['gasto_mensual_est'] / df['ingresos']
df['utilizacion_credito'] = df['deuda'] / df['limite']

features = ['ingresos', 'proporcion_gasto_ingreso', 'utilizacion_credito']
df[features] = df[features].fillna(0)

# 3. ENTRENAMIENTO (K=4)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[features])

# Usamos random_state=42 para que los IDs de los clusters no cambien cada vez que corres el código
kmeans = KMeans(n_clusters=4, random_state=42, n_init='auto')
df['cluster_id'] = kmeans.fit_predict(X_scaled)

# 4. MAPEO DEFINITIVO (Basado en tu último diagnóstico)
def etiquetar_perfil(cluster_id):
    mapping = {
        0: "Perfil Premium (Ingresos Altos)",
        1: "Gastador Frecuente",
        2: "Ahorrador Conservador",
        3: "Al Límite (Riesgo de Deuda)"
    }
    return mapping.get(cluster_id, "Perfil Estándar")

df['perfil_financiero'] = df['cluster_id'].apply(etiquetar_perfil)

# 5. GUARDAR EN DUCKDB
df_final = df[['user_id', 'perfil_financiero', 'cluster_id']]
con.execute("CREATE OR REPLACE TABLE segmentos_clientes AS SELECT * FROM df_final")

# Mostrar resumen final para tu reporte
print("\n--- RESUMEN FINAL DE SEGMENTACIÓN ---")
print(df.groupby('perfil_financiero')[features].mean().round(2))

con.close()
print("\n[EXITO] Tabla 'segmentos_clientes' actualizada en DuckDB.")
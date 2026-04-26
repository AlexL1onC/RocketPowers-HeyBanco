from fastapi import FastAPI
from pydantic import BaseModel
import duckdb

app = FastAPI(title="delfos API")

DB_PATH = "havi.duckdb"


def query_db(sql: str, params=None):
    con = duckdb.connect(DB_PATH)
    df = con.execute(sql, params or []).fetchdf()
    con.close()
    return df
def r(x):
    return round(float(x), 2)

@app.get("/")
def home():
    return {
        "status": "ok",
        "message": "Delfos API funcionando"
    }

@app.get("/user/{user_id}/summary")
def user_summary(user_id: str):
    
    sexo_map = {
        "H": "Hombre",
        "M": "Mujer",
        "SE": "Sin especificar"
    }

    cliente = query_db("""
        SELECT 
            user_id,
            edad,
            sexo,
            estado,
            ciudad,
            nivel_educativo,
            ocupacion,
            ingreso_mensual_mxn,
            antiguedad_dias,
            es_hey_pro,
            nomina_domiciliada,
            score_buro,
            dias_desde_ultimo_login,
            satisfaccion_1_10,
            num_productos_activos,
            patron_uso_atipico
        FROM clientes
        WHERE user_id = ?
    """, [user_id])

    if cliente.empty:
        return {"error": "Usuario no encontrado", "user_id": user_id}

    productos = query_db("""
        SELECT
            COUNT(*) AS total_productos,

            COALESCE(SUM(CASE 
                WHEN tipo_producto IN ('cuenta_debito', 'cuenta_negocios')
                THEN saldo_actual ELSE 0 END), 0) AS dinero_disponible,

            COALESCE(SUM(CASE 
                WHEN tipo_producto = 'inversion_hey'
                THEN saldo_actual ELSE 0 END), 0) AS dinero_invertido,

            COALESCE(SUM(CASE 
                WHEN tipo_producto IN (
                    'tarjeta_credito_hey',
                    'tarjeta_credito_garantizada',
                    'tarjeta_credito_negocios',
                    'credito_personal',
                    'credito_auto',
                    'credito_nomina'
                )
                THEN saldo_actual ELSE 0 END), 0) AS deuda_credito,

            COALESCE(SUM(CASE 
                WHEN tipo_producto LIKE 'seguro_%'
                THEN 1 ELSE 0 END), 0) AS total_seguros,

            COALESCE(SUM(limite_credito), 0) AS limite_credito_total

        FROM productos
        WHERE user_id = ?
    """, [user_id])

    transacciones = query_db("""
        SELECT
            COUNT(*) AS total_transacciones,
            COALESCE(SUM(monto), 0) AS gasto_total,
            COALESCE(AVG(monto), 0) AS ticket_promedio,
            COUNT(DISTINCT DATE(fecha_hora)) AS racha_dias_uso,
            COALESCE(SUM(CASE WHEN estatus = 'no_procesada' THEN 1 ELSE 0 END), 0) AS transacciones_fallidas,
            COALESCE(SUM(CASE WHEN es_internacional = TRUE THEN 1 ELSE 0 END), 0) AS transacciones_internacionales,
            COALESCE(SUM(cashback_generado), 0) AS cashback_total
        FROM transacciones
        WHERE user_id = ?
    """, [user_id])

    categoria_top = query_db("""
        SELECT categoria_mcc, SUM(monto) AS total
        FROM transacciones
        WHERE user_id = ?
        GROUP BY categoria_mcc
        ORDER BY total DESC
        LIMIT 1
    """, [user_id])
    tipos_producto = query_db("""
        SELECT tipo_producto, COUNT(*) AS cantidad
        FROM productos
        WHERE user_id = ?
        GROUP BY tipo_producto
    """, [user_id]) 

    row_cliente = cliente.iloc[0]
    row_productos = productos.iloc[0]
    row_tx = transacciones.iloc[0]

    tipos_producto_dict = {
    row["tipo_producto"]: int(row["cantidad"])
    for _, row in tipos_producto.iterrows()
    }

    limite_credito_total = r(row_productos["limite_credito_total"])
    deuda_credito = r(row_productos["deuda_credito"])

    utilizacion_credito = (
        r(deuda_credito / limite_credito_total)
        if limite_credito_total > 0 else 0
    )
    return {
        "user_id": user_id,
        "cliente": {
            "edad": int(row_cliente["edad"]),
            "sexo": sexo_map.get(row_cliente["sexo"], "Desconocido"),
            "ubicacion": f"{row_cliente['ciudad']}, {row_cliente['estado']}",
            "nivel_educativo": row_cliente["nivel_educativo"],
            "ocupacion": row_cliente["ocupacion"],
            "ingreso_mensual_mxn": r(row_cliente["ingreso_mensual_mxn"]),
            "antiguedad_dias": int(row_cliente["antiguedad_dias"]),
            "es_hey_pro": bool(row_cliente["es_hey_pro"]),
            "nomina_domiciliada": bool(row_cliente["nomina_domiciliada"]),
            "score_buro": int(row_cliente["score_buro"]),
            "dias_desde_ultimo_login": int(row_cliente["dias_desde_ultimo_login"]),
            "satisfaccion_1_10": int(row_cliente["satisfaccion_1_10"]),
            "num_productos_activos": int(row_cliente["num_productos_activos"]),
            "patron_uso_atipico": bool(row_cliente["patron_uso_atipico"])
        },
         "productos": {
            "total_productos": int(row_productos["total_productos"]),
            "tipos_producto": tipos_producto_dict,
            "dinero_disponible": r(row_productos["dinero_disponible"]),
            "dinero_invertido": r(row_productos["dinero_invertido"]),
            "deuda_credito": deuda_credito,
            "limite_credito_total": limite_credito_total,
            "utilizacion_credito": utilizacion_credito,
            "total_seguros": int(row_productos["total_seguros"])
        },
        
        "transacciones": {
            "total_transacciones": int(row_tx["total_transacciones"]),
            "gasto_total": r(row_tx["gasto_total"]),
            "ticket_promedio": r(row_tx["ticket_promedio"]),
            "racha_dias_uso": int(row_tx["racha_dias_uso"]),
            "transacciones_fallidas": int(row_tx["transacciones_fallidas"]),
            "transacciones_internacionales": int(row_tx["transacciones_internacionales"]),
            "cashback_total": r(row_tx["cashback_total"]),
            "categoria_top": categoria_top.iloc[0]["categoria_mcc"] if not categoria_top.empty else None
        }
    }


class ChatRequest(BaseModel):
    user_id: str
    message: str


@app.post("/chat")
def chat(req: ChatRequest):
    return {
        "user_id": req.user_id,
        "message": req.message,
        "response": "Hola, soy Delfos. Ya recibí tu mensaje y puedo analizar tus transacciones."
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
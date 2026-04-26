---

# **Delfos IA - Asistente Financiero Hey Banco**

Delfos es un asistente financiero inteligente que integra **LLM + análisis de datos + segmentación de usuarios** para generar recomendaciones personalizadas.

---

## **Funcionalidades**

### **1. Dashboard Financiero**

* Balance total
* Gasto mensual
* Inversiones
* Visualización de gastos por categoría

---

### **2. Recomendaciones Inteligentes**

Basadas en clustering de usuarios:

| Cluster | Perfil             |
| ------- | ------------------ |
| 0       | Perfil Premium     |
| 1       | Gastador frecuente |
| 2       | Ahorrador          |
| 3       | Riesgo de deuda    |

* Se genera 1 recomendación por usuario
* Se almacena en DuckDB (cache)
* Evita múltiples llamadas al LLM

---

### **3. Financial Twin (Gastos)**

* Agrupación por categorías
* Top comercios por categoría
* Visualización interactiva

---

### **4. Chat IA (Delfos)**

* Responde preguntas financieras
* Usa contexto del usuario
* Guarda historial en el navegador

---

## **Arquitectura**

```text
Frontend (HTML + JS + CSS)
        ↓
FastAPI (Backend)
        ↓
DuckDB (Base de datos)
        ↓
LLM (Gemini / fallback local)
```

---

## **Requisitos**

* Python 3.10+
* pip
* Navegador web
* (Opcional) API Key de Gemini

---

## **Instalación**

```bash
cd tu_proyecto
pip install fastapi uvicorn duckdb pandas pyyaml google-generativeai
```

Archivos necesarios:

```text
main.py
havi.duckdb
config.json
master_prompt.yaml
src/
```

---

## **Ejecución**

### Backend

```bash
python main.py
```

### Frontend

```bash
python -m http.server 5500
```

Abrir en navegador:

```
http://localhost:5500
```

---

## **Pruebas**

### Chat

* “¿En qué gasto más?”
* “Dame una recomendación”
* “¿Cómo puedo ahorrar?”

### Dashboard

* Visualización de datos del usuario
* Categorías de gasto
* Recomendación personalizada

---

## **Flujo de Recomendación**

1. Obtener `cluster_id`
2. Construir prompt
3. Llamar LLM (si no hay cache)
4. Guardar en DuckDB
5. Reutilizar en consultas futuras

---

## **Persistencia**

| Elemento        | Ubicación    |
| --------------- | ------------ |
| Recomendaciones | DuckDB       |
| Datos usuario   | DuckDB       |
| Chat            | localStorage |

---

## **Equipo: Rocket Powers**
import requests

# Prueba una por una
urls = [
    "http://127.0.0.1:8000/test/delfos/USR-00001",
    "http://localhost:8000/test/delfos/USR-00001",
    "http://0.0.0.0:8000/test/delfos/USR-00001",
]

for url in urls:
    try:
        r = requests.get(url, timeout=5)
        print(f"✅ {url}")
        print(r.json())
        break
    except Exception as e:
        print(f"❌ {url} → {e}")
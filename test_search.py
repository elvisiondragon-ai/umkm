from duckduckgo_search import DDGS

try:
    with DDGS() as ddgs:
        results = list(ddgs.text("TOMORO COFFEE Citra 6 cafe Jakarta Barat", max_results=5))
        for r in results:
            print(r['href'])
            print(r['title'])
            print("---")
except Exception as e:
    print("Error:", e)

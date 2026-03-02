import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import time
import csv
import re

def search_ddg_lite(query):
    url = "https://lite.duckduckgo.com/lite/"
    data = urllib.parse.urlencode({'q': query}).encode('utf-8')
    req = urllib.request.Request(url, data=data)
    req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36')
    try:
        response = urllib.request.urlopen(req, timeout=10)
        html = response.read().decode('utf-8')
        soup = BeautifulSoup(html, 'html.parser')
        
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if 'instagram.com' in href:
                # Cleanup the duckduckgo wrapper if any
                clean_link = href
                if 'uddg=' in href:
                    raw_uddg = href.split('uddg=')[1].split('&')[0]
                    clean_link = urllib.parse.unquote(raw_uddg)
                links.append(clean_link)
        return links
    except Exception as e:
        print("Error fetching DDG Lite:", e)
        return []

print(search_ddg_lite("SAGA Coffee Jakarta Barat site:instagram.com"))
print(search_ddg_lite("TOMORO COFFEE Citra 6 site:instagram.com"))

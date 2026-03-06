import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import re
import csv
import time

def search_yahoo_ig(query):
    url = "https://search.yahoo.com/search?p=" + urllib.parse.quote_plus(query)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0'})
    try:
        response = urllib.request.urlopen(req, timeout=10)
        html = response.read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'html.parser')
        
        for a in soup.find_all('a', href=True):
            href = a['href']
            # Yahoo wraps links in r.search.yahoo.com.../RU=url/RK=
            if 'RU=' in href:
                try:
                    actual_url = urllib.parse.unquote(href.split('RU=')[1].split('/RK=')[0])
                    if 'instagram.com/' in actual_url:
                        # Extract username accurately
                        match = re.search(r'instagram\.com/([a-zA-Z0-9_.]+)', actual_url)
                        if match:
                            username = match.group(1)
                            ignored = ['p', 'reel', 'explore', 'tags', 'stories', 'reels']
                            if username.lower() not in ignored and len(username) > 2:
                                return "https://instagram.com/" + username
                except:
                    pass
    except Exception as e:
        print("Yahoo Error:", e)
    return None

print(search_yahoo_ig("SAGA Coffee Jakarta Barat site:instagram.com"))
print(search_yahoo_ig("TOMORO COFFEE Citra 6 site:instagram.com"))

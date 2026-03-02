import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import re
import csv
import time
import os

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
                        match = re.search(r'instagram\.com/([a-zA-Z0-9_.]+)', actual_url)
                        if match:
                            username = match.group(1)
                            ignored = ['p', 'reel', 'explore', 'tags', 'stories', 'reels', 'about', 'web', 'login', 'directory']
                            if username.lower() not in ignored and len(username) > 2:
                                return "https://instagram.com/" + username
                except:
                    pass
    except Exception as e:
        print("Yahoo Error:", e)
    return None

def main():
    input_file = "clientlist.csv"
    output_dir = "client"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "client_searchv2.csv")
    
    valid_count = 0
    max_target = 300
    
    with open(input_file, mode='r', encoding='utf-8') as infile, \
         open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
        
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        
        header = next(reader)
        # Business name, category, instaram, whatsapp, Valid point, website external
        writer.writerow(["No", "Business name", "category", "instaram", "whatsapp", "Valid point", "website external"])
        
        for row in reader:
            if len(row) < 3: continue
            
            name = row[0].strip()
            phone = row[1].strip()
            category = row[2].strip()
            
            query = f"{name} {category} Jakarta Barat site:instagram.com"
            print(f"Checking: {name}...")
            
            ig_link = search_yahoo_ig(query)
            
            if ig_link:
                valid_count += 1
                print(f"[{valid_count}] FOUND Instagram for {name}: {ig_link}")
                writer.writerow([valid_count, name, category, ig_link, phone, "3", "non existed"])
                
                if valid_count >= max_target:
                    print("Reached target goal.")
                    break
            else:
                print(f"    NO Instagram found for {name}, skipping.")
                
            time.sleep(1) # delay to avoid rate limit
            
    print(f"Finished. Saved {valid_count} valid leads to {output_file}.")

if __name__ == '__main__':
    main()

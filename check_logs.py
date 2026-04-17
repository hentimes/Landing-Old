from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os

try:
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    driver = webdriver.Chrome(options=chrome_options)

    # Get directly to Live Server
    driver.get("http://127.0.0.1:5500/index.html")

    print("--- Console Logs ---")
    for entry in driver.get_log('browser'):
        print(entry)
        
    driver.quit()
    print("--------------------")
except Exception as e:
    print(f"Selenium no esta disponible: {e}")

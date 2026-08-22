import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

load_dotenv()

def verify_confluence():
    url = os.getenv("ATLASSIAN_URL")
    email = os.getenv("ATLASSIAN_EMAIL")
    token = os.getenv("ATLASSIAN_API_TOKEN")

    print(f"Testing Confluence access for: {email}")
    print(f"Target URL: {url}")

    # 1. Test Space Listing
    api_url = f"{url.rstrip('/')}/wiki/api/v2/spaces"
    auth = HTTPBasicAuth(email, token)
    
    try:
        response = requests.get(api_url, auth=auth, timeout=10)
        print(f"Space API Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            spaces = data.get("results", [])
            print(f"Found {len(spaces)} spaces.")
            for s in spaces:
                print(f"- Space: {s.get('name')} (Key: {s.get('key')})")
        else:
            print(f"Error: {response.text}")

        # 2. Test Page Listing
        page_api_url = f"{url.rstrip('/')}/wiki/api/v2/pages?limit=10"
        response = requests.get(page_api_url, auth=auth, timeout=10)
        print(f"\nPage API Status: {response.status_code}")
        if response.status_code == 200:
            pages = response.json().get("results", [])
            print(f"Found {len(pages)} recent pages.")
            for p in pages:
                print(f"- Page: {p.get('title')} (ID: {p.get('id')})")
        else:
            print(f"Error: {response.text}")

    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    verify_confluence()

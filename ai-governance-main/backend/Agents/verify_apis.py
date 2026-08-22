import requests
import json

def test_endpoint(url):
    print(f"Testing {url}...")
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Count: {data.get('count')}")
            # Print first item if exists
            if data.get('data') and len(data['data']) > 0:
                print("First item preview:")
                print(json.dumps(data['data'][0], indent=2))
            else:
                print("No data items returned.")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_endpoint("http://localhost:8000/agent/integrations/jira")
    print("-" * 20)
    test_endpoint("http://localhost:8000/agent/integrations/confluence")

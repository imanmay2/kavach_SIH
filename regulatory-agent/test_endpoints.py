import requests
import json
import time
import os

BASE_URL = "http://localhost:8000"
PDF_PATH = "maharashtra_pollution_guidelines_2023.pdf"

def print_response(endpoint, response):
    print(f"\n--- {endpoint} ---")
    print(f"Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def run_tests():
    # 1. /intake
    intake_payload = {
        "session_id": "test_session_1",
        "messages": [
            {"role": "user", "content": "I want to start a large manufacturing plant in Maharashtra in the Setup stage."}
        ]
    }
    res_intake = requests.post(f"{BASE_URL}/intake", json=intake_payload)
    print_response("/intake", res_intake)
    
    # Use the extracted data for the next step, fallback if error
    if res_intake.status_code == 200:
        extracted_data = res_intake.json().get("extracted_data", {})
    else:
        extracted_data = {
            "sector": "Manufacturing",
            "location": "Maharashtra",
            "project_size": "Large",
            "stage": "Setup"
        }

    # 2. /select-approvals
    approval_payload = {
        "session_id": "test_session_1",
        "intake_data": {
            "sector": str(extracted_data.get("sector", "")),
            "location": str(extracted_data.get("location", "")),
            "project_size": str(extracted_data.get("project_size", "")),
            "stage": str(extracted_data.get("stage", ""))
        }
    }
    res_approval = requests.post(f"{BASE_URL}/select-approvals", json=approval_payload)
    print_response("/select-approvals", res_approval)

    approvals = []
    if res_approval.status_code == 200:
        approvals = [app["approval"] for app in res_approval.json().get("approvals", [])]
    if not approvals:
        approvals = ["Environmental Clearance"]

    # 3. /prevalidate
    prevalidate_payload = {
        "session_id": "test_session_1",
        "selected_approvals": approvals,
        "submitted_documents": [
            {
                "name": "site_plan_v2.pdf",
                "content_summary": "Topographical mapping and site boundary drawings for the manufacturing plant."
            }
        ]
    }
    res_preval = requests.post(f"{BASE_URL}/prevalidate", json=prevalidate_payload)
    print_response("/prevalidate", res_preval)

    # 4. /sync-docs
    if os.path.exists(PDF_PATH):
        with open(PDF_PATH, "rb") as f:
            files = {"file": (PDF_PATH, f, "application/pdf")}
            res_sync = requests.post(f"{BASE_URL}/sync-docs", files=files)
        print_response("/sync-docs", res_sync)
    else:
        print(f"\n--- /sync-docs --- \nFailed: {PDF_PATH} not found.")

    # 5. /rag-query
    rag_payload = {
        "question": "What are the rules for effluent discharge in Maharashtra?"
    }
    res_rag = requests.post(f"{BASE_URL}/rag-query", json=rag_payload)
    print_response("/rag-query", res_rag)

if __name__ == "__main__":
    time.sleep(2)  # Give server a moment to be fully ready
    run_tests()

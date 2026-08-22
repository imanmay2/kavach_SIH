import sys
import os
from pathlib import Path

# Add the parent directory to sys.path to import agents
sys.path.append(str(Path(__file__).resolve().parent.parent))

from agents.integration_service import integration_service
import json

def test_direct():
    print("Fetching Jira issues...")
    jira_data = integration_service.fetch_jira_issues()
    print(f"Jira count: {len(jira_data)}")
    
    print("\nFetching Confluence pages...")
    confluence_data = integration_service.fetch_confluence_pages()
    print(f"Confluence count: {len(confluence_data)}")
    
    output = {
        "jira": jira_data,
        "confluence": confluence_data
    }
    
    with open("integration_output.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print("\nOutput saved to integration_output.json")

if __name__ == "__main__":
    test_direct()

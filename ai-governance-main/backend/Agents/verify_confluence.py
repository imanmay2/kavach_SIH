import asyncio
import os
import sys
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Ensure we can import from agents
sys.path.append(os.path.dirname(__file__))

from agents.integration_service import integration_service

async def test_integration():
    print(f"Testing MCP Integration...")
    print(f"Target URL: {integration_service.url}")
    print(f"Target Email: {integration_service.username}")
    print("-" * 50)
    
    print("Fetching requirements using MCP...")
    # Call the actual MCP extraction function
    results = await integration_service.extract_requirements_mcp("requirements")
    
    print("-" * 50)
    if results:
        print(f"✅ Successfully extracted {len(results)} requirements:")
        for r in results:
            print(f"- [{r.get('id', 'N/A')}] {r.get('title', 'Untitled')} (Priority: {r.get('priority', 'N/A')})")
            print(f"  {r.get('description', '')[:100]}...")
    else:
        print("❌ No requirements found or extraction failed.")

if __name__ == "__main__":
    asyncio.run(test_integration())

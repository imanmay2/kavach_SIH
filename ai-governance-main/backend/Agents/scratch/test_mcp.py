import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from agents.integration_service import integration_service

async def test():
    print(f"Testing MCP with URL: {integration_service.url}")
    print(f"Email: {integration_service.username}")
    res = await integration_service.extract_requirements_mcp("requirements")
    print(f"Result: {res}")

if __name__ == "__main__":
    asyncio.run(test())

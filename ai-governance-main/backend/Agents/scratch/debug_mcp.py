import asyncio
import os
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from dotenv import load_dotenv

load_dotenv()

async def verify_mcp():
    url = os.getenv("ATLASSIAN_URL")
    username = os.getenv("ATLASSIAN_EMAIL")
    password = os.getenv("ATLASSIAN_API_TOKEN")

    if not all([url, username, password]):
        print("Missing credentials")
        return

    mcp_script_path = os.path.abspath(os.path.join(os.getcwd(), "..", "node_modules", "@aashari", "mcp-server-atlassian-confluence", "dist", "index.js"))
    
    server_params = StdioServerParameters(
        command="node",
        args=[mcp_script_path],
        env={
            **os.environ,
            "ATLASSIAN_SITE_NAME": url.replace("https://", "").split(".")[0],
            "ATLASSIAN_USER_EMAIL": username,
            "ATLASSIAN_API_TOKEN": password,
        }
    )

    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                
                print("--- Listing Spaces ---")
                spaces = await session.call_tool("ls-spaces", {})
                print(spaces.content[0].text)
                
                print("\n--- Searching for 'requirement' ---")
                cql = 'text ~ "requirement" OR title ~ "requirement" order by created desc'
                search = await session.call_tool("search-cql", {"cql": cql})
                print(search.content[0].text)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(verify_mcp())

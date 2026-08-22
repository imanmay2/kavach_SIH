import asyncio
import os
import sys
import re
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from dotenv import load_dotenv

load_dotenv()

async def debug_confluence():
    url = os.getenv("ATLASSIAN_URL")
    email = os.getenv("ATLASSIAN_EMAIL")
    token = os.getenv("ATLASSIAN_API_TOKEN")
    
    if not all([url, email, token]):
        print("Missing credentials in .env")
        return

    site_name = url.replace("https://", "").split(".")[0]
    server_params = StdioServerParameters(
        command="npx.cmd" if os.name == 'nt' else "npx",
        args=["-y", "@modelcontextprotocol/server-confluence"],
        env={
            **os.environ,
            "ATLASSIAN_SITE_NAME": site_name,
            "ATLASSIAN_URL": url,
            "ATLASSIAN_USER_EMAIL": email,
            "ATLASSIAN_API_TOKEN": token,
        }
    )

    try:
        print(f"Connecting to Confluence MCP ({site_name})...")
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await asyncio.wait_for(session.initialize(), timeout=20.0)
                
                # 1. List Spaces
                print("\nListing Spaces...")
                res = await session.call_tool("list_spaces", {})
                print(res.content[0].text)
                
                # 2. Search Content
                print("\nSearching for 'requirements'...")
                res = await session.call_tool("search_content", {"query": "requirements"})
                print(f"Search Results: {res.content[0].text}")
                
                # 3. Get Specific Page (if ID found)
                pids = re.findall(r'(\d{5,15})', res.content[0].text)
                if pids:
                    print(f"\nReading first page found (ID: {pids[0]})...")
                    res = await session.call_tool("get_content_by_id", {"pageId": pids[0]})
                    print(f"Page Content (first 500 chars): {res.content[0].text[:500]}...")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_confluence())

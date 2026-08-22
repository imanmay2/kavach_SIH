import asyncio
import os
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from dotenv import load_dotenv

load_dotenv()

async def list_tools():
    url = os.getenv("ATLASSIAN_URL")
    email = os.getenv("ATLASSIAN_EMAIL")
    token = os.getenv("ATLASSIAN_API_TOKEN")
    
    if not all([url, email, token]):
        print("Missing credentials in .env")
        return

    site_name = url.replace("https://", "").split(".")[0]
    
    # Try the official server
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
                tools = await session.list_tools()
                print("\nAvailable Tools:")
                for tool in tools.tools:
                    print(f"- {tool.name}: {tool.description}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(list_tools())

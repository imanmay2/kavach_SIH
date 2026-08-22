import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

def test_flash():
    print(f"Testing Gemini-1.5-Flash with key: {api_key[:5]}...")
    try:
        # Testing with explicitly forced model name
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)
        response = llm.invoke("Hi")
        print(f"SUCCESS: {response.content}")
    except Exception as e:
        print(f"FLASH TEST FAILED: {str(e)}")

if __name__ == "__main__":
    test_flash()

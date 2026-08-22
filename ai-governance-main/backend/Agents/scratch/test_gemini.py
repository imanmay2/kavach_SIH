import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

def test_gemini():
    print(f"Testing Gemini API with key: {api_key[:5]}...{api_key[-5:]}")
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", google_api_key=api_key)
        response = llm.invoke("Hello, say 'API Working' if you can hear me.")
        print(f"RESPONSE: {response.content}")
    except Exception as e:
        print(f"DIAGNOSTIC FAILED: {str(e)}")

if __name__ == "__main__":
    test_gemini()

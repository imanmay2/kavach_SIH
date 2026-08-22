# Regulatory Agent

This directory contains the regulatory AI compliance agents for the SIH 26129 project.

## Environment Variables
Copy `.env.example` to `.env` and fill in your `GOOGLE_API_KEY`. The models are pre-configured.

> **API Quota Limitation:** The free tier of the Google Gemini API has a hard limit of **20 requests per day** for some models (including `gemini-3.6-flash`). Each E2E test run sequentially triggers the LLM four times. **Do not spam the test script** right before a demo, or you will exhaust the daily quota and encounter a `500 Internal Server Error (RESOURCE_EXHAUSTED)`. Attach a billing account to the GCP project if high volume is required.

## Testing
Run the E2E test script to test all endpoints:
```bash
python test_endpoints.py
```

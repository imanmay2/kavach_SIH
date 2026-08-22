# Mock Department Adapters

These are mock standalone adapters simulating external department systems. They follow a common REST interface modeled after the main repository's Python Agents, and they publish events to the `event-bus`.

## API Conventions (Agent Model)

- **Response Envelope**: Successful responses use the `{ "success": true, "data": ... }` or `{ "success": true, ... }` format.
- **Error Format**: Errors match FastAPI's HTTPExceptions using `{ "detail": "error message" }`. Note: As an intentional simplification for these mocks, validation errors return `400 Bad Request` instead of FastAPI's default `422 Unprocessable Entity`, which aligns with the explicit manual validation checks in some of the main repo's Python agents.
- **Field Naming**: All fields use `snake_case` (e.g., `project_type`, `reference_id`) to match the backend agents.

## Common Interface

Each adapter runs on its own port and provides the following endpoints:

### 1. Fetch Records
Fetch all seeded mock records in the department.

**Endpoint:** `POST /fetch_record`

**Example:**
```bash
curl -X POST http://localhost:4001/fetch_record -H "Content-Type: application/json"
```

### 2. Submit Record
Submit a new application or record to the department. This stores the record in-memory and triggers a `RECORD_SUBMITTED` event.

**Endpoint:** `POST /submit_record`

**Example:**
```bash
curl -X POST http://localhost:4001/submit_record \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "project_type": "Hospital", "location": "Navi Mumbai"}'
```
**Example Response:**
```json
{
  "success": true,
  "data": {
    "reference_id": "MUN-1007",
    "message": "Record submitted successfully"
  }
}
```

### 3. Cycle Status
Gets the status of a specific record by its ID. Repeated calls will cycle the status through `Pending -> UnderReview -> Approved`. Transitions will trigger a `STATUS_CHANGED` event.

**Endpoint:** `GET /status/:id`

**Example:**
```bash
curl http://localhost:4001/status/MUN-1001
```

## Running the Adapters

Install dependencies and start each adapter individually:

```bash
# Municipal Department (Port 4001)
cd dept-municipal
npm install express
npm start

# Fire NOC Department (Port 4002)
cd ../dept-fire-noc
npm install express
npm start

# Pollution Department (Port 4003)
cd ../dept-pollution
npm install express
npm start
```

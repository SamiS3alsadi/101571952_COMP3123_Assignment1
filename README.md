# COMP3123 Assignment 1 - Employee Management REST API

Student: 101571952 | Course: COMP3123 (XLIST Fall 2026) | George Brown Polytechnic

A secure RESTful backend built with Node.js, Express 5, MongoDB (Mongoose) and JWT authentication. Users register, log in, and manage their own employee records. Each user can only see and change the employees they created.

## Technologies

- Node.js and Express 5 with Express Router modules
- MongoDB Atlas with Mongoose 8 (database name `comp3123_assignment1`)
- bcryptjs for password hashing
- jsonwebtoken for JWT authentication (HS256)
- Helmet for HTTP security headers
- express-rate-limit for brute-force and abuse protection
- express-validator for input validation
- dotenv for environment configuration

## Architecture

```
server.js              start-up: env check, DB connection, listen
app.js                 Express app: middleware, routes, health check
config/db.js           MongoDB connection
models/                User and Employee schemas
routes/                Route definitions (user and employee)
controllers/           Request handling and business logic
validators/            express-validator rules
middleware/            auth (JWT), validate, rateLimit, errorHandler, requestLogger
utils/                 AppError class and file logger
logs/app.log           Local log file (generated at run time, not committed)
postman/               Postman collection for testing
```

## Installation

1. Clone the repository and enter the folder:
   ```bash
   git clone https://github.com/<your-username>/101571952_COMP3123_Assignment1.git
   cd 101571952_COMP3123_Assignment1
   ```
2. Install dependencies: `npm install`
3. Create the environment file: copy `.env.example` to `.env` and fill in your values (see Configuration).
4. Start the server: `npm start` (or `npm run dev` to restart on file changes).
5. Confirm it works: open `http://localhost:8081/health`.

## Configuration

| Variable | Purpose |
|---|---|
| `PORT` | Port the server listens on (default 8081) |
| `MONGODB_URI` | MongoDB connection string. Keep the real value in `.env` only. |
| `JWT_SECRET` | Secret used to sign tokens. Use a random string of 32+ characters. |
| `JWT_EXPIRES_IN` | Token lifetime, for example `1h` |
| `LOG_DIR` | Folder for the log file (default `logs`) |

The `.env` file is listed in `.gitignore` and is never committed. Only `.env.example`, with placeholder values, is in the repository.

## Health Check

`GET /health` returns:
```json
{ "success": true, "status": "ok", "database": "connected", "uptime_seconds": 42 }
```

## API Endpoints

Base paths: `/api/v1/user` and `/api/v1/emp`. All request and response bodies are JSON.

| # | Method | Path | Auth | Success | Purpose |
|---|---|---|---|---|---|
| 1 | POST | `/api/v1/user/signup` | No | 201 | Register a user |
| 2 | POST | `/api/v1/user/login` | No | 200 | Log in, returns a JWT |
| 3 | GET | `/api/v1/emp/employees` | JWT | 200 | List the caller's employees |
| 4 | POST | `/api/v1/emp/employees` | JWT | 201 | Create an employee owned by the caller |
| 5 | GET | `/api/v1/emp/employees/{eid}` | JWT | 200 | Get one of the caller's employees |
| 6 | PUT | `/api/v1/emp/employees/{eid}` | JWT | 200 | Update one of the caller's employees |
| 7 | DELETE | `/api/v1/emp/employees?eid={eid}` | JWT | 204 | Delete one of the caller's employees |

### Request bodies

Signup: `{ "username": "sami_01", "email": "sami@example.com", "password": "Passw0rd1" }`

Login: `{ "username": "sami_01", "password": "Passw0rd1" }` or `{ "email": "sami@example.com", "password": "..." }`

Employee create (all fields required):
```json
{
  "first_name": "Ana",
  "last_name": "Silva",
  "email": "ana.silva@example.com",
  "position": "Developer",
  "salary": 65000,
  "date_of_joining": "2026-01-15",
  "department": "Engineering"
}
```

Employee update: any subset of the same fields (at least one is required). The `user` field cannot be set by the client.

### Validation rules

- Username: 3 to 30 characters, letters, numbers and underscores only.
- Email: valid email format, max 254 characters.
- Password: 8 to 72 characters, with at least one letter and one number.
- Employee names and department: 1 to 50 (names) or 100 (department) characters.
- Salary: a positive number. Date of joining: a valid ISO 8601 date.
- Path and query IDs must be valid MongoDB ObjectIds.
- Unknown fields in an employee body are rejected with 400.

## Authentication

1. Sign up with `POST /api/v1/user/signup`.
2. Log in with `POST /api/v1/user/login`. The response contains a `token`.
3. Send the token on every employee request: `Authorization: Bearer <token>`.

Missing, malformed, invalid or expired tokens return 401. The owner of each employee is taken from the verified token (the `sub` claim), never from the request body or URL, so a client cannot claim another user's identity.

## Authorization (Ownership)

Each employee document stores the ID of the user who created it in the `user` field. Every employee query includes that owner ID in the database filter, for example `Employee.findOne({ _id: eid, user: req.user.id })`. Changing the `eid` in the URL or query therefore cannot reach another user's record.

When a user requests an employee that exists but belongs to someone else, the API returns **404 Not Found**, the same response as for an ID that does not exist. This was chosen over 403 Forbidden so that the API does not reveal which IDs exist. Other users' employees never appear in list results.

## Security

- **Password hashing:** bcrypt with 12 salt rounds. Passwords are stored only as hashes and the field is excluded from queries by default (`select: false`).
- **JWT:** signed with `JWT_SECRET`, HS256 only, with an expiry. Signature, expiry and algorithm are verified on each request.
- **Helmet:** sets security headers such as `X-Content-Type-Options`, `Strict-Transport-Security`, and removes `X-Powered-By`. This reduces risks like MIME sniffing and framing attacks.
- **Rate limiting:** see below.
- **Input validation and size limits:** express-validator rules, and JSON bodies are limited to 10 KB.
- **Secrets:** read from environment variables only.
- **Error responses:** never include stack traces, passwords, secrets or database details. Server errors return a generic message.
- **Login errors:** wrong username and wrong password return the same message, so accounts cannot be enumerated.

## Rate Limiting

Rate limiting caps how many requests one client (identified by IP) can make in a time window. This slows down password guessing and automated abuse.

| Scope | Limit | Window | Endpoints |
|---|---|---|---|
| Authentication | 10 requests | 15 minutes | `POST /api/v1/user/signup`, `POST /api/v1/user/login` |
| General API | 200 requests | 15 minutes | All routes under `/api/v1` |

When a limit is exceeded the API returns **429 Too Many Requests** with a JSON message. Standard `RateLimit` headers show the remaining quota. To test it, send more than 10 login requests within 15 minutes; the 11th request should return 429. Record the result as a screenshot for submission.

## Logging

- Log file: `logs/app.log` (one JSON object per line, with a timestamp).
- Logged: server start-up, database connection, each request (method, path, status, duration), signups, login successes and failures, auth failures, validation failures, ownership rejections, rate-limit events, and server errors.
- Never logged: passwords, tokens, the JWT secret, the database URI, or request bodies.

## Status Codes Used

| Code | Meaning in this API |
|---|---|
| 200 | Successful read, update or login |
| 201 | Resource created (signup, employee) |
| 204 | Employee deleted, no body |
| 400 | Validation failure, malformed JSON, invalid ID format |
| 401 | Missing, invalid or expired token; wrong login credentials |
| 404 | Unknown route, or employee not found / not owned by the caller |
| 409 | Duplicate username or email |
| 413 | Request body too large |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error (generic message returned) |

## Testing

Import `postman/101571952_COMP3123_Assignment1.postman_collection.json` into Postman. The collection sets `baseUrl` and `token` as variables, and the login request saves the token automatically. The collection covers success and failure cases for every endpoint, including the two-user ownership test (user A cannot read, update or delete user B's employee).

## Sample Test Accounts

These accounts are for marking and testing only. They contain no real data.

| Username | Email | Password |
|---|---|---|
| tester_a | tester_a@example.com | Passw0rd1 |
| tester_b | tester_b@example.com | Passw0rd2 |

If these accounts do not exist yet, sign up with them using `POST /api/v1/user/signup`. Then log in with `POST /api/v1/user/login`.

## Deployment

Deployed API URL: _to be added after deployment_

# Survey Platform — Backend

REST API for the Survey Platform, built with Node.js, Express, and TypeScript.

The backend handles authentication, survey management, public survey submissions, and survey analytics.

## Live API

- **Backend:** https://survey-backend-d8mr.onrender.com
- **Health Check:** https://survey-backend-d8mr.onrender.com/api/health
- **Frontend:** https://survey-frontend-ashen-three.vercel.app

## Features

### Authentication
- Admin login using email and password
- JWT-based authentication
- Protected admin routes
- Forgot-password and password-reset endpoints
- Password hashing with bcrypt

### Survey Management
- Create and manage surveys
- Update and delete surveys
- Publish surveys
- Retrieve surveys with pagination
- Search surveys

### Public Survey System
- Retrieve published surveys
- Submit survey responses without admin authentication
- Validate required questions and response types
- Support conditional question visibility

### Analytics
- Survey response counts
- Multiple-choice and checkbox response statistics
- Rating averages
- Text response summaries

## Tech Stack

- Node.js
- Express.js
- TypeScript
- JWT
- bcrypt
- CORS
- JSON-file storage

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/RUDRA-ani/survey-backend.git
cd survey-backend
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

RESET_TOKEN_EXPIRES_MINUTES=15
```

Replace the example credentials and secret with your own values.

**Never commit your `.env` file or expose your JWT secret and admin password.**

### Build the Project

```bash
npm run build
```

### Run Development Server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

### Start Production Server

```bash
npm start
```

### Create Admin Account

```bash
npm run seed:admin
```

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Admin login |
| `/` | `/api/auth/*` | Authentication and password reset routes |
| `/` | `/api/surveys/*` | Admin survey management |
| `/` | `/api/public/*` | Public surveys and response submissions |
| `/` | `/api/analytics/*` | Survey analytics |

Protected admin endpoints require a valid JWT access token.

## Data Storage

The current implementation uses JSON files for data storage.

Data files are maintained in `src/data/`.

**Important:** JSON-file storage is suitable for development and testing, but the current Render deployment uses an ephemeral filesystem. Data may be lost after restarts or redeployments. Persistent database storage should be configured before relying on the application for production data.

## Deployment

The backend is deployed as a Web Service on **Render**.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

The backend uses the `PORT` environment variable supplied by Render.

CORS is configured to allow the local development frontend and the deployed Vercel frontend.

## Frontend Repository

[Survey Platform Frontend](https://github.com/RUDRA-ani/survey-frontend)

## Author

**Anirudra Dahal**

- GitHub: [RUDRA-ani](https://github.com/RUDRA-ani)
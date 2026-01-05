# Conversation Session Service

Backend service for managing conversation sessions and events for a Voice AI platform.

Built with **NestJS**, **TypeScript**, and **MongoDB**, following a layered, enterprise-style structure.

---

## Tech Stack

- Node.js
- TypeScript
- NestJS
- MongoDB (Mongoose)
- Jest (unit testing)

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- MongoDB (local or cloud instance)
- npm or yarn

### Clone the repository

`git clone <repository-url>`
`cd conversation-session-service`

### Install dependencies

`npm install`

### Environment Configuration

- Create a .env file in the root directory:
  **PORT=3000**
  **MONGODB_URI=mongodb://localhost:27017/conversation-session**

### How to Run the Project

- Run in development mode
  `npm run start:dev`

- The service will start on:
  `http://localhost:3000`

### Run Unit Tests

`npm test`

## API Overview

**Create or Get Session**
`POST /sessions`

**Add Event to Session**
`POST /sessions/:sessionId/events`

**Get Session with Events**
`GET /sessions/:sessionId`

**Complete Session**
`POST /sessions/:sessionId/complete`

## Assumptions Made

1. `sessionId` is externally generated and globally unique.
2. `eventId` is unique per session and provided by the caller.
3. Events are immutable once created.
4. A completed session should not accept new events.
5. Authentication and authorization are out of scope for this assignment.
6. Session and event retention policies were not specified and are not implemented.

## Design Notes

1. Idempotency and concurrency safety are enforced using MongoDB atomic operations and unique indexes.
2. Database-level constraints are preferred over in-memory checks.
3. Error handling is centralized using a global MongoDB exception filter.
4. The service layer contains business logic; controllers remain thin.

For more details, see `DESIGN.md`.

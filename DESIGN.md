# DESIGN.md

## 1. How did you ensure idempotency?

Ans. Idempotency is primarily enforced at the database level rather than in the application code.

- Session creation is handled using an atomic `findOneAndUpdate` operation with `upsert: true`, keyed by `sessionId`. This ensures that if the same request is sent multiple times, MongoDB guarantees that only one session document is created.
- Events are safeguarded by a compound unique index on `(sessionId, eventId)`. If a duplicate event request is received, MongoDB rejects the insert, and the service simply returns the already existing event.
- Completing a session is inherently idempotent: the update operation only executes if the session is not already in the `completed` state.

This strategy eliminates the need for in-memory checks or locks, ensuring consistent idempotency even when multiple instances of the service are running.

---

## 2. How does your design behave under concurrent requests?

Ans. The system is designed to handle concurrent requests safely by leveraging MongoDB’s atomic guarantees for all critical operations.

- Session creation is managed using atomic upserts, ensuring that concurrent requests with the same `sessionId` do not result in duplicate sessions.
- Event insertion is protected by unique indexes, preventing duplicate writes even when multiple requests are processed simultaneously.
- Session completion is implemented with a conditional update (`status != completed`), ensuring that only the first request triggers the state transition.

By relying on database-level concurrency control, the system allows multiple application instances to run in parallel without requiring additional coordination.

---

## 3. What MongoDB indexes did you choose and why?

Ans. The indexes were carefully chosen to ensure both correctness and optimal read performance:

- A unique index on `sessionId` in the `ConversationSession` collection ensures that only one session exists for each external ID.
- A compound unique index on `(sessionId, eventId)` in the `ConversationEvent` collection guarantees that events are unique within a session, supporting idempotency.
- Another compound index on `(sessionId, timestamp)` allows efficient retrieval of events sorted by time, aligning with the primary read pattern.

These indexes were designed based on actual access patterns, avoiding the overhead of indexing unnecessary fields.

---

## 4. How would you scale this system for millions of sessions per day?

Ans. The system is designed to scale incrementally as demand grows:

- The API layer can be horizontally scaled because the service is stateless, allowing multiple instances to handle requests in parallel.
- Data can be partitioned by `sessionId` using MongoDB sharding, which helps distribute the write load across multiple shards.
- To manage storage growth, TTL (time-to-live) or archival strategies can be implemented for old sessions and events.
- If read traffic becomes dominant, frequently accessed session metadata can be cached to improve performance.
- For high event volumes, events could be stored in a separate write-optimized database or streamed to a queue for downstream processing.

The current design avoids premature optimization while keeping these scaling options open for future needs.

---

## 5. What did you intentionally keep out of scope, and why?

Ans. To maintain focus and readability, the following aspects were intentionally left out:

- Authentication and authorization, as they are separate concerns from the session/event domain.
- Soft deletes and retention policies, since no specific lifecycle rules were provided.
- Distributed tracing, metrics, and logging infrastructure.
- Cross-session analytics or aggregation queries.

These features can be added in the future without requiring changes to the core data model or APIs. Excluding them ensures the implementation remains aligned with the assignment’s scope.

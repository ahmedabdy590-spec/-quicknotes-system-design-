# QuickNotes Architecture

## Functional requirements

- Users can register, sign in, and access only their own notes.
- Users can create, read, update, and delete notes.
- Users can organize notes with tags.
- The API validates input and returns consistent success and error responses.
- The service supports paginated note lists.

## Non-functional requirements

- **Availability:** The service should remain usable during an individual server or worker failure.
- **Scalability:** It should handle 1 million registered users and scale app servers and read capacity as demand grows.
- **Performance:** Frequently requested note data and static assets should be served with low latency.
- **Durability:** Committed notes should survive app server failures.
- **Security:** Use HTTPS, authenticated requests, authorization checks, and safe password hashing.
- **Observability:** Collect logs, metrics, traces, and alerts for errors, latency, and queue backlog.

## Load estimate for 1 million users

### Assumptions

- 1,000,000 registered users.
- 10% are active each day: 100,000 daily active users.
- Each active user reads 50 note/feed pages and writes 1 note per day.
- Average note content is 2 KB; estimate includes 20% overhead for metadata and indexes.
- Workload is averaged over 86,400 seconds per day; peak is estimated at five times the average.
- Storage is retained for one year; this estimate excludes backups and replicas.

| Measure                   |                Calculation |               Estimate |
| ------------------------- | -------------------------: | ---------------------: |
| Daily active users        |            1,000,000 × 10% |                100,000 |
| Reads per day             |               100,000 × 50 |              5,000,000 |
| Average reads per second  |         5,000,000 ÷ 86,400 |         **about 58/s** |
| Peak reads per second     |                     58 × 5 |        **about 290/s** |
| Writes per day            |                100,000 × 1 |                100,000 |
| Average writes per second |           100,000 ÷ 86,400 |        **about 1.2/s** |
| Peak writes per second    |                    1.2 × 5 |          **about 6/s** |
| Note storage per year     | 100,000 × 2 KB × 365 × 1.2 | **about 8.76 TB/year** |

The service is read-heavy under these assumptions, so it should scale read traffic with caching, a CDN for static assets, and a database read replica.

## Architecture diagram

```text
+-------------+       +------+       +-----+       +----------------+
| Web / mobile|------>| DNS  |------>| CDN |------>| Load balancer  |
| client      |       +------+       +--+--+       +-------+--------+
+------+------+                          |                  |
       |                                 |             +----+----+
       | API requests                    |             |         |
       +---------------------------------------------->| App 1   |
                                                     +->| App 2   |
                                                     |  | App N   |
                                                     |  +----+----+
                                                     |       |
                                          +----------+-------+------+
                                          |                         |
                                    +-----v-----+             +-----v------+
                                    |   Cache   |             |  Primary   |
                                    +-----------+             | database   |
                                                              +-----+------+
                                                                    |
                                                             replication
                                                                    |
                                                              +-----v------+
                                                              | Read       |
                                                              | replica    |
                                                              +------------+

                                      +-------------------+
                                      | Queue             |
                                      | background jobs   |
                                      +---------+---------+
                                                |
                                          +-----v------+
                                          | Worker     |
                                          | email,     |
                                          | cleanup,   |
                                          | exports    |
                                          +------------+
```

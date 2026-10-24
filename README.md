# QuickNotes

QuickNotes is a small browser client for practicing API requests and a system design exercise for a notes service intended to support up to one million registered users.

The browser app uses the JSONPlaceholder practice API to load, create, and delete sample posts. JSONPlaceholder does not permanently store changes made by POST or DELETE requests. The `docs` folder describes a proposed real QuickNotes API, data model, and scalable architecture.

## Project files

- `index.html` — QuickNotes page and note form.
- `style.css` — page and status message styling.
- `api.js` — GET, POST, and DELETE requests to the practice API.
- [`docs/api-design.md`](docs/api-design.md) — proposed REST API endpoints and examples.
- [`docs/data-model.md`](docs/data-model.md) — relational schema, SQL statements, queries, and indexes.
- [`docs/architecture.md`](docs/architecture.md) — requirements, load estimates, architecture, request flows, and trade-offs.

## How to run the API client

1. Clone or download this repository.
2. Open `index.html` in a modern web browser.
3. Select **Load notes** to retrieve sample posts.
4. Use the form to create a note, or select **Delete** on a note to remove it from the current page.

The client connects to `https://jsonplaceholder.typicode.com/posts`. An internet connection is required. The practice API simulates creating and deleting posts; those changes are not permanently saved by the service.

## What I learned

- How to make asynchronous GET, POST, and DELETE requests with `fetch`.
- How to show loading, success, empty, and error states in a browser UI.
- How to validate user input and safely add user-provided text with `textContent`.
- How SQL primary keys, foreign keys, indexes, and joins model notes and tags.
- How caching, read replicas, queues, and workers help a service scale.

## Assignment repository

Submit the GitHub repository URL for this project. The Day 8 presentation is graded separately.

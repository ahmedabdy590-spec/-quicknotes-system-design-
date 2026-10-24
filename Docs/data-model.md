# QuickNotes Data Model

QuickNotes uses four relational entities: users, notes, tags, and the join table note_tags.

## Entities and columns

### users

| Column        | Type                                | Key / constraints                  |
| ------------- | ----------------------------------- | ---------------------------------- |
| id            | BIGINT GENERATED ALWAYS AS IDENTITY | Primary key                        |
| email         | VARCHAR(255)                        | Required, unique                   |
| password_hash | VARCHAR(255)                        | Required                           |
| display_name  | VARCHAR(100)                        | Required                           |
| created_at    | TIMESTAMP WITH TIME ZONE            | Required, defaults to current time |

### notes

| Column     | Type                                | Key / constraints                   |
| ---------- | ----------------------------------- | ----------------------------------- |
| id         | BIGINT GENERATED ALWAYS AS IDENTITY | Primary key                         |
| user_id    | BIGINT                              | Required, foreign key to `users.id` |
| title      | VARCHAR(100)                        | Required                            |
| body       | TEXT                                | Optional                            |
| created_at | TIMESTAMP WITH TIME ZONE            | Required, defaults to current time  |
| updated_at | TIMESTAMP WITH TIME ZONE            | Required, defaults to current time  |

### tags

| Column     | Type                                | Key / constraints                        |
| ---------- | ----------------------------------- | ---------------------------------------- |
| id         | BIGINT GENERATED ALWAYS AS IDENTITY | Primary key                              |
| user_id    | BIGINT                              | Required, foreign key to `users.id`      |
| name       | VARCHAR(50)                         | Required                                 |
| created_at | TIMESTAMP WITH TIME ZONE            | Required, defaults to current time       |
| —          | —                                   | Unique constraint on (`user_id`, `name`) |

### note_tags

| Column     | Type                     | Key / constraints                             |
| ---------- | ------------------------ | --------------------------------------------- |
| note_id    | BIGINT                   | Primary key column; foreign key to `notes.id` |
| tag_id     | BIGINT                   | Primary key column; foreign key to `tags.id`  |
| created_at | TIMESTAMP WITH TIME ZONE | Required, defaults to current time            |

The composite primary key of `note_tags` is (`note_id`, `tag_id`), so a tag can only be attached to a given note once.

## Relationships

- **Users to notes: one-to-many.** One user can own many notes; each note belongs to exactly one user through `notes.user_id`.
- **Users to tags: one-to-many.** One user can create many tags; each tag belongs to exactly one user through `tags.user_id`.
- **Notes to tags: many-to-many.** A note can have many tags and a tag can be attached to many notes. The `note_tags` join table stores each association.

## CREATE TABLE statements

These PostgreSQL statements create the tables and keys:

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, tag_id)
);
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 20;
SELECT n.id, n.title, n.body
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 42
  AND t.name = 'work'
ORDER BY n.updated_at DESC;
INSERT INTO notes (user_id, title, body)
VALUES (42, 'Plan weekend trip', 'Book a train and choose a hotel.')
RETURNING id, user_id, title, body, created_at, updated_at;
CREATE INDEX notes_user_created_at_idx
ON notes (user_id, created_at DESC);
```

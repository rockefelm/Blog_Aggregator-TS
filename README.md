
# Blog Aggregator CLI - (Gator)

A TypeScript-based CLI tool for aggregating and managing blog posts from RSS feeds. Uses Drizzle ORM and PostgreSQL for data storage.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup & Migration](#database-setup--migration)
- [Usage](#usage)
- [Command Reference](#command-reference)
- [Tracking Changes](#tracking-changes)
- [License](#license)


## Prerequisites

- **Node.js (v18+ recommended)**: Install from [nodejs.org](https://nodejs.org/).
- **npm**: Comes with Node.js.
- **TypeScript**: Installed as a dev dependency; no global install required.
- **Drizzle ORM**: Installed via npm as a dependency.
- **PostgreSQL**:
  - Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/).
  - Start the PostgreSQL service:
    ```bash
    sudo service postgresql start
    ```
  - Create a database and user (example):
    ```bash
    sudo -u postgres psql
    CREATE DATABASE gator;
    CREATE USER postgres WITH PASSWORD 'postgres';
    GRANT ALL PRIVILEGES ON DATABASE gator TO postgres;
    \q
    ```
  - Update your connection string in `drizzle.config.ts` as needed.

## Installation
Clone the repository and install dependencies:
```bash
npm install
```

## Configuration
Database and migration settings are managed in `drizzle.config.ts`. Edit this file to set your PostgreSQL connection details and migration options. Example:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "src//lib/db/schema.ts",
  out: "src/lib/db",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable",
  },
});
```

Update the `url` field with your database credentials as needed.

## Database Setup & Migration
1. **Configure your database connection**
  - Edit `drizzle.config.ts` and set your PostgreSQL connection details (host, port, user, password, database).
  - Set any required environment variables.
2. **Generate migrations**
  ```bash
  npm run generate
  ```
3. **Run migrations**
  ```bash
  npm run migrate
  ```
Migrations and schema files are located in `src/lib/db/`.

## Usage
Run the CLI using npm:
```bash
npm run start <command> [args]
```
Or directly:
```bash
node dist/index.js <command> [args]
```

### Examples
- Log in: `npm run start login alice`
- Register: `npm run start register bob`
- Add a feed: `npm run start addfeed "My Blog" https://myblog.com/rss`
- Aggregate feeds every 10 seconds: `npm run start agg 10s`
- List feeds: `npm run start feeds`
- Follow a feed: `npm run start follow https://myblog.com/rss`
- Browse posts: `npm run start browse 5`

**Note:** Commands like `addfeed`, `follow`, `following`, `unfollow`, and `browse` require you to be logged in.

## Command Reference
| Command      | Usage Example | Description |
|--------------|--------------|-------------|
| `login`      | `login <username>` | Log in as an existing user. |
| `register`   | `register <username>` | Register a new user and log in as them. |
| `reset`      | `reset` | Reset the database. |
| `users`      | `users` | List all users, marking the current one. |
| `agg`        | `agg <interval>` | Aggregate RSS feeds at a given interval (e.g., `agg 10s`). |
| `addfeed`    | `addfeed <feed_name> <url>` | Add a new RSS feed (must be logged in). |
| `feeds`      | `feeds` | List all feeds. |
| `follow`     | `follow <feed_url>` | Follow a feed by its URL (must be logged in). |
| `following`  | `following` | List feeds you are following (must be logged in). |
| `unfollow`   | `unfollow <feed_url>` | Unfollow a feed by its URL (must be logged in). |
| `browse`     | `browse [limit]` | Browse recent posts for the current user (must be logged in). |

## Tracking Changes
This project uses Git for version control. Commit your changes regularly:
```bash
git add .
git commit -m "Your message"
```

## License
MIT

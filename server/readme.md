# Paymesh

A backend service built with **Rust**, **Axum**, and **PostgreSQL**.
Supports running via **Docker** (recommended) or **local setup**.

---

## 🚀 Getting Started

### 1. Prerequisites

**For Docker setup (recommended):**

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/)

**For Local setup:**

* [Rust](https://www.rust-lang.org/tools/install) (latest stable)
* [Cargo](https://doc.rust-lang.org/cargo/)
* [PostgreSQL](https://www.postgresql.org/download/)
* [sqlx-cli](https://crates.io/crates/sqlx-cli)

```bash
cargo install sqlx-cli --no-default-features --features postgres
```

---

### 2. Clone the Repository

```bash
git clone https://github.com/Web3Novalabs/PayMesh.git
cd PayMesh
```

---

### 3. Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

`.env` example:

```env
RPC_URL=""
PRIVATE_KEY=""
PUBLIC_KEY=""
CONTRACT_ADDRESS=""

DATABASE_URL=postgresql://myuser:mypassword123@localhost:5432/mydatabase

DATABASE_URL_USER=myuser           
DATABASE_URL_PASSWORD=mypassword123 
DATABASE_URL_DB=mydatabase       
```

---

## 🐳 Option 1: Run with Docker (Recommended)

### Start services

```bash
docker-compose up --build
```

* Starts **Postgres** (`db` service)
* Runs your **Axum app** (`server` service)

👉 Backend available at: `http://localhost:8080`

### Run migrations

```bash
docker-compose run server sqlx migrate run
```

### Stop services

```bash
docker-compose down
```

---

## 💻 Option 2: Run Locally

### 1. Create database

```bash
createdb mydatabase
```

### 2. Run migrations

```bash
sqlx migrate run
```

### 3. Start app

```bash
cargo run
```

👉 App available at: `http://localhost:8080`

## 🧑‍💻 Development Setup

During development, you may want to:

Run Postgres in Docker

Run the backend locally with cargo run (for hot reload & debugging)

1. Start only the database
```
docker-compose up db
```

This starts Postgres and exposes it at localhost:5432.

2. Configure .env for local dev
```
DATABASE_URL=postgresql://myuser:mypassword123@localhost:5432/mydatabase
```

3. Run migrations
```
sqlx migrate run
```

For changes made in the db migrations file, reset the db `sqlx database reset` and re run migrations.

4. Start the backend locally
```
cargo watch -x run
```


👉 Backend will now auto-reload on code changes, while the database runs inside Docker.

## 🛠 Useful Commands

* **Run with hot reload (local):**

  ```bash
  cargo watch -x run
  ```
* **Format & lint:**

  ```bash
  cargo fmt --all
  cargo clippy
  ```
* **Reset Docker setup:**

  ```bash
  docker-compose down -v
  docker-compose up --build
  ```
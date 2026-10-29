# Sharing the Backend with Docker — Complete Guide

This guide explains how to package and send the entire backend stack (API, MongoDB with seeded data, and Mongo Express) to your friend or teammate.

---

## 1. What Has Been Configured & Fixed

1. **`Dockerfile` added**:
   - Built on `node:20-alpine`.
   - Runs the backend API on port `5000`.
2. **`docker-compose.yml` simplified**:
   - Added the `api` service (backend container).
   - Configured Docker internal networking (`mongo:27017`).
   - Removed fragile shell healthcheck so Docker starts immediately without timing out.
   - Added port mappings for all services:
     - **API & Swagger**: `http://localhost:5000` / `http://localhost:5000/api-docs`
     - **MongoDB**: `localhost:27017`
     - **Mongo Express GUI**: `http://localhost:8081` (`test` / `test`)
3. **Automatic Database Seeding on First Boot**:
   - When the backend connects for the first time, it checks if the database is empty. If empty, it **automatically runs the seed script directly inside Node.js** to create all 45 teams, 10 products, 6 categories, coupons, and test users!
   - Self-contained, zero shell script permission issues, zero `mongorestore` dependencies.
4. **`.dockerignore` added**:
   - Excludes heavy `node_modules`, `logs/`, and local files from the build.

---

## 2. Option A (Recommended): Send as a ZIP / Git Repository (~5 MB)

This is the cleanest and fastest way to send the backend.

### Step 1: Zip the backend folder
Zip the `backend` folder, but **DO NOT** include `node_modules` (Docker installs them inside the container):

**Folders/Files to include:**
```text
backend/
├── docker/
│   └── init-mongo/         <-- (Contains restore.sh and database dump)
├── src/
├── docs/
├── .dockerignore
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
└── package-lock.json
```

*(You can exclude `node_modules/` to make the ZIP file only ~5 MB instead of 300+ MB).*

---

### Step 2: What your friend needs to do
Send your friend these 2 simple steps:

1. Unzip the folder and open a terminal inside `backend/`.
2. Run:
   ```bash
   docker compose up -d --build
   ```

**That's it!** Docker will build the image, start MongoDB, restore the seed data, start Mongo Express, and start the API.

---

## 3. Option B: Send as Pre-Built Docker Images (`.tar` file)

If your friend has a slow internet connection or you want to give them pre-built images with zero building:

### Step 1: On your machine, build and save the images
```bash
# 1. Build the backend image
docker compose build

# 2. Save the images to a single compressed archive
docker save -o mriwl-stack.tar backend-api:latest mongo:latest mongo-express:latest
```

### Step 2: Send to your friend
Send your friend:
1. `mriwl-stack.tar`
2. `docker-compose.yml`
3. The `docker/init-mongo` folder

### Step 3: On your friend's machine
Your friend runs:
```bash
# 1. Load the images
docker load -i mriwl-stack.tar

# 2. Start the stack
docker compose up -d
```

---

## 4. How Your Friend Can Verify Everything

Once running, your friend can open:

- 📖 **Swagger Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- 📡 **API Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
- 🗄️ **Mongo Express Web GUI**: [http://localhost:8081](http://localhost:8081) (User: `test` / Pass: `test`)

### Seeded Credentials
- **Admin**: `admin@mriwl.com` / `Admin@12345678`
- **Client**: `user@mriwl.com` / `User@12345678`

### Useful Docker Commands for Your Friend
```bash
# View live API logs
docker compose logs -f api

# Re-run seed script manually if ever needed
docker compose exec api npm run seed

# Stop the containers
docker compose down

# Stop and wipe database to start completely fresh
docker compose down -v
```

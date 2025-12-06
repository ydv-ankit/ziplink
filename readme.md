# Go URL Shortener

A full-stack URL shortener application with a high-performance Go backend and React frontend.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **URL Shortening**: Generate short URLs with customizable expiration dates
- **Redis Caching**: Fast URL resolution with 30-minute cache TTL
- **MySQL Database**: Persistent storage using GORM ORM
- **Metrics Dashboard**: Built-in monitoring endpoint
- **Security**: HTTP-only cookies, CORS protection, and secure token handling

## 🏗️ Architecture

```
go-url-shortener/
├── api/          # Go backend (Fiber framework)
├── client/       # React frontend (Vite + TypeScript)
└── docker-compose.yml
```

## 🛠️ Tech Stack

### Backend
- **Framework**: [Fiber v2](https://github.com/gofiber/fiber)
- **Database**: MySQL with [GORM](https://gorm.io/)
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## 📋 Prerequisites

- Go 1.24.4 or higher
- Node.js and npm
- MySQL 8.0 or higher
- Redis server
- Docker and Docker Compose (optional)

## 🚀 Quick Start

### 1. Start Infrastructure Services

Using Docker Compose:
```bash
docker-compose up -d
```

This starts MySQL on port 3306.

### 2. Backend Setup

```bash
cd api

# Install dependencies
go mod download

# Create .env file (see api/README.md for details)
# Set environment variables:
# - APP_PORT=:8080
# - MYSQL_HOST=localhost:3306
# - MYSQL_USER=root
# - MYSQL_PASS=root
# - MYSQL_DB=url_shortener
# - REDIS_ADDR=localhost:6379
# - JWT_SECRET=your-secret-key

# Run the server
go run main.go
```

The API will be available at `http://localhost:8080`

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000` (or the port Vite assigns)

## 📡 API Endpoints

### Public
- `POST /api/v1/create-user` - Register new user
- `POST /api/v1/login` - User login
- `POST /api/v1/logout` - User logout
- `GET /:short` - Resolve short URL (redirects to original)

### Protected (Requires Authentication)
- `POST /api/v1/shorten` - Create short URL
- `DELETE /api/v1/delete` - Delete short URL

### Monitoring
- `GET /metrics` - Application metrics dashboard

For detailed API documentation, see [api/README.md](api/README.md)

## 🔐 Security Features

- Password hashing with bcrypt (cost factor 10)
- JWT tokens with HS256 signing
- HTTP-only cookies to prevent XSS
- CORS protection
- Secure cookies in production
- Transaction-safe database operations

## 📦 Project Structure

### Backend (`api/`)
- `config/` - Database and Redis configuration
- `models/` - Data models (User, URL)
- `routes/` - API route handlers
- `utils/` - Utility functions (JWT, logger, env parser)

### Frontend (`client/`)
- `src/` - React application source code
- Built with Vite for fast development and optimized builds

## 🐳 Docker

The project includes a `docker-compose.yml` file for easy setup of MySQL. Redis can be added similarly or run separately.

## 📝 Environment Variables

See [api/README.md](api/README.md) for complete environment variable documentation.

## 📚 Documentation

- [Backend API Documentation](api/README.md) - Detailed API documentation, endpoints, and setup instructions

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.


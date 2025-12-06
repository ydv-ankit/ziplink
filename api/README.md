# URL Shortener API

A high-performance URL shortener backend service built with Go and Fiber framework. This API provides secure user authentication, URL shortening with expiration, and efficient caching using Redis.

## Features

- 🔐 **User Authentication**: JWT-based authentication with secure password hashing
- 🔗 **URL Shortening**: Generate short URLs with customizable expiration dates
- ⚡ **Redis Caching**: Fast URL resolution with 30-minute cache TTL
- 🗄️ **MySQL Database**: Persistent storage using GORM ORM
- 📊 **Metrics**: Built-in monitoring endpoint
- 🔒 **Security**: HTTP-only cookies, CORS protection, and secure token handling

## Tech Stack

- **Framework**: [Fiber v2](https://github.com/gofiber/fiber) - Express-inspired web framework
- **Database**: MySQL with [GORM](https://gorm.io/)
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Project Structure

```
api/
├── config/          # Database and Redis configuration
│   ├── mysql.go     # MySQL connection and setup
│   └── redis.go     # Redis client configuration
├── models/          # Data models
│   ├── url.go       # URL model with CRUD operations
│   └── user.go      # User model with authentication
├── routes/          # API route handlers
│   ├── resolver.go  # URL resolution with caching
│   ├── shorten.go   # URL shortening logic
│   ├── url.go       # URL deletion
│   └── user.go      # User registration, login, logout
├── utils/           # Utility functions
│   ├── env.go       # Environment variable parser
│   ├── jwt.go       # JWT token generation and verification
│   └── logger.go    # Logging utilities
└── main.go          # Application entry point
```

## Prerequisites

- Go 1.24.4 or higher
- MySQL 8.0 or higher
- Redis server

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd go-url-shortener/api
   ```

2. **Install dependencies**:
   ```bash
   go mod download
   ```

3. **Set up environment variables**:
   Create a `.env` file in the `api` directory with the following variables:
   ```env
   APP_PORT=:8080
   APP_ENV=development
   
   MYSQL_HOST=localhost:3306
   MYSQL_USER=root
   MYSQL_PASS=root
   MYSQL_DB=url_shortener
   
   REDIS_ADDR=localhost:6379
   REDIS_PASS=
   
   JWT_SECRET=your-secret-key-here
   ```

4. **Start MySQL and Redis**:
   Using Docker Compose (from project root):
   ```bash
   docker-compose up -d
   ```
   
   Or start them manually:
   ```bash
   # MySQL
   mysql -u root -p
   
   # Redis
   redis-server
   ```

5. **Run the application**:
   ```bash
   go run main.go
   ```

   The server will start on the port specified in `APP_PORT` (default: `:8080`).

## API Endpoints

### Public Endpoints

#### 1. Create User
- **POST** `/api/v1/create-user`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User created successfully",
    "success": true,
    "data": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

#### 2. Login
- **POST** `/api/v1/login`
- **Description**: Authenticate user and receive JWT token
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: Sets HTTP-only cookie with JWT token
  ```json
  {
    "message": "User logged in successfully",
    "success": true,
    "data": {
      "userId": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

#### 3. Logout
- **POST** `/api/v1/logout`
- **Description**: Clear authentication cookie
- **Response**: Redirects to home page

#### 4. Resolve URL
- **GET** `/:short`
- **Description**: Redirect to original URL (cached for 30 minutes)
- **Parameters**: `short` - The short URL identifier
- **Response**: 
  - `307 Temporary Redirect` to original URL
  - `404 Not Found` if URL doesn't exist
  - `410 Gone` if URL has expired

### Protected Endpoints (Require Authentication)

#### 5. Shorten URL
- **POST** `/api/v1/shorten`
- **Description**: Create a new short URL
- **Authentication**: Required (JWT token in cookie)
- **Request Body**:
  ```json
  {
    "long": "https://example.com/very/long/url",
    "expiry": "2024-12-31T23:59:59Z"  // Optional, defaults to 30 days
  }
  ```
- **Response**:
  ```json
  {
    "message": "Short url created successfully",
    "success": true,
    "data": {
      "id": "uuid",
      "userId": "uuid",
      "long": "https://example.com/very/long/url",
      "short": "abc1234",
      "expiry": "2024-12-31T23:59:59Z"
    }
  }
  ```

#### 6. Delete URL
- **DELETE** `/api/v1/delete`
- **Description**: Delete a short URL (only by owner)
- **Authentication**: Required (JWT token in cookie)
- **Request Body**:
  ```json
  {
    "id": "url-uuid"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Url deleted successfully",
    "success": true
  }
  ```

### Monitoring

#### 7. Metrics
- **GET** `/metrics`
- **Description**: Fiber monitor dashboard for application metrics
- **Response**: HTML dashboard with real-time metrics

## URL Generation

- Short URLs are generated using base62 encoding (0-9, a-z, A-Z)
- Default length: 7 characters
- Collision detection with automatic retry (up to 10 attempts)
- Atomic generation using database transactions

## Caching Strategy

- **Cache Duration**: 30 minutes TTL
- **Cache Key**: Short URL identifier
- **Cache Miss**: Falls back to MySQL database
- **Cache Hit**: Direct Redis lookup for faster response

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `password` (String, Hashed with bcrypt)
- `created_at`, `updated_at`, `deleted_at` (Timestamps)

### URLs Table
- `id` (UUID, Primary Key)
- `user_id` (String, Foreign Key)
- `long` (String, Original URL)
- `short` (String, Unique, Short URL identifier)
- `expiry` (DateTime, URL expiration)
- `created_at`, `updated_at`, `deleted_at` (Timestamps)

## Security Features

- **Password Hashing**: bcrypt with cost factor 10
- **JWT Tokens**: HS256 signing with configurable secret
- **HTTP-Only Cookies**: Prevents XSS attacks
- **CORS Protection**: Configured for specific origins
- **Secure Cookies**: Enabled in production environment
- **Transaction Safety**: Database operations use transactions for atomicity

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `APP_PORT` | Server port | `:8080` | Yes |
| `APP_ENV` | Environment (development/production) | - | Yes |
| `MYSQL_HOST` | MySQL host and port | - | Yes |
| `MYSQL_USER` | MySQL username | - | Yes |
| `MYSQL_PASS` | MySQL password | - | Yes |
| `MYSQL_DB` | MySQL database name | - | Yes |
| `REDIS_ADDR` | Redis address | - | Yes |
| `REDIS_PASS` | Redis password | - | No |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |

## Development

### Running in Development Mode

```bash
# Set environment
export APP_ENV=development

# Run the server
go run main.go
```

### Building for Production

```bash
# Build binary
go build -o bin/server main.go

# Run binary
./bin/server
```

### Database Migrations

The application automatically runs migrations on startup using GORM's `AutoMigrate` feature. Tables are created/updated automatically when the application starts.

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "success": false,
  "error": "Detailed error message"
}
```

## Logging

The application uses a custom logger that includes:
- Timestamp
- File path and line number
- Log message

Example log output:
```
[2024-01-15 10:30:45] -> ./config/mysql.go:24: MYSQL client connected
```

## Performance Considerations

- **Redis Caching**: Reduces database load for frequently accessed URLs
- **Connection Pooling**: GORM handles MySQL connection pooling
- **Transaction Management**: Ensures data consistency
- **Efficient URL Generation**: Base62 encoding with collision detection

## Contributing

Feel free to contribute your ideas.

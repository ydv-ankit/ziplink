# URL Shortener API

A high-performance URL shortener backend service built with Go and Fiber framework. This API provides secure user authentication, URL shortening with expiration, and efficient caching using Redis.

## Features

- 🔐 **User Authentication**: JWT-based authentication with secure password hashing
- 🔗 **URL Shortening**: Generate short URLs with customizable expiration dates (default: 30 days)
- ⚡ **Redis Caching**: Fast URL resolution with 30-minute cache TTL
- 🗄️ **MySQL Database**: Persistent storage using GORM ORM
- 📊 **Metrics**: Built-in monitoring endpoint with Fiber monitor dashboard
- 🔒 **Security**: HTTP-only cookies, CORS protection, and secure token handling
- 🐳 **Docker Support**: Containerized deployment with Docker Compose

## Tech Stack

- **Framework**: [Fiber v2](https://github.com/gofiber/fiber) - Express-inspired web framework
- **Database**: MySQL 8.0 with [GORM](https://gorm.io/)
- **Cache**: Redis 7
- **Authentication**: JWT (JSON Web Tokens) using `golang-jwt/jwt/v5`
- **Password Hashing**: bcrypt with cost factor 10
- **UUID Generation**: Google UUID library

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
│   ├── url.go       # URL management (get all, delete)
│   └── user.go      # User registration, login, logout
├── utils/           # Utility functions
│   ├── env.go       # Environment variable parser
│   ├── jwt.go       # JWT token generation and verification
│   └── logger.go    # Logging utilities
├── Dockerfile       # Docker build configuration
├── env.example      # Environment variables template
├── go.mod           # Go module dependencies
└── main.go          # Application entry point
```

## Prerequisites

- **Go**: 1.21 or higher (check with `go version`)
- **MySQL**: 8.0 or higher
- **Redis**: 7 or higher
- **Docker & Docker Compose**: Optional, for containerized deployment

## Installation

### Option 1: Local Development

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
   Copy `env.example` to `.env` and configure:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   REDIS_ADDR=localhost:6379
   REDIS_PASS= # optional
   APP_PORT=:8080
   APP_HOST=localhost
   DOMAIN=localhost:8080
   MYSQL_HOST=localhost:3306
   MYSQL_DB=url_shortener
   MYSQL_USER=root
   MYSQL_PASS=root
   JWT_SECRET=your-secret-jwt-key-change-in-production
   APP_ENV=development
   APP_URL_FRONTEND=http://localhost:5173
   ```

4. **Start MySQL and Redis**:
   Using Docker Compose (from project root):
   ```bash
   cd ..
   docker-compose up -d mysql redis
   ```
   
   Or start them manually:
   ```bash
   # MySQL
   mysql -u root -p
   CREATE DATABASE url_shortener;
   
   # Redis
   redis-server
   ```

5. **Run the application**:
   ```bash
   go run main.go
   ```

   The server will start on the port specified in `APP_PORT` (default: `:8080`).

### Option 2: Docker Deployment

1. **From project root**, start all services:
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MySQL database on port 3306
   - Redis cache on port 6379
   - API server on port 3000

2. **View logs**:
   ```bash
   docker-compose logs -f api
   ```

3. **Stop services**:
   ```bash
   docker-compose down
   ```

## API Endpoints

### Public Endpoints

#### 1. Create User
- **POST** `/api/v1/create-user`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** (200 OK):
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
- **Error Responses**:
  - `400 Bad Request`: Invalid request body or user already exists
  - `500 Internal Server Error`: Server error during user creation

#### 2. Login
- **POST** `/api/v1/login`
- **Description**: Authenticate user and receive JWT token in HTTP-only cookie
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** (200 OK): Sets HTTP-only cookie with JWT token (24-hour expiration)
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
- **Error Responses**:
  - `400 Bad Request`: Invalid request body
  - `404 Not Found`: User not found
  - `401 Unauthorized`: Invalid credentials
  - `500 Internal Server Error`: Server error during authentication

#### 3. Logout
- **POST** `/api/v1/logout`
- **Description**: Clear authentication cookie and log out user
- **Response**: `200 OK` (cookie is cleared)

#### 4. Resolve URL
- **GET** `/:short`
- **Description**: Redirect to original URL (cached for 30 minutes in Redis)
- **Parameters**: 
  - `short` (path parameter) - The short URL identifier (7 characters)
- **Response**: 
  - `307 Temporary Redirect` to original URL (if valid and not expired)
  - `404 Not Found` if URL doesn't exist
  - `410 Gone` if URL has expired
- **Caching**: Results are cached in Redis for 30 minutes to improve performance

### Protected Endpoints (Require Authentication)

All protected endpoints require a valid JWT token in an HTTP-only cookie named `token`. If the token is missing or invalid, the API returns `401 Unauthorized`.

#### 5. Get All URLs
- **GET** `/api/v1/urls`
- **Description**: Retrieve all URLs created by the authenticated user
- **Authentication**: Required (JWT token in cookie)
- **Response** (200 OK):
  ```json
  {
    "message": "Urls fetched successfully",
    "success": true,
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "long": "https://example.com/very/long/url",
        "short": "abc1234",
        "expiry": "2024-12-31T23:59:59Z",
        "createdAt": "2024-01-15T10:30:45Z",
        "updatedAt": "2024-01-15T10:30:45Z"
      }
    ]
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication token
  - `500 Internal Server Error`: Server error during retrieval

#### 6. Shorten URL
- **POST** `/api/v1/shorten`
- **Description**: Create a new short URL with customizable expiration
- **Authentication**: Required (JWT token in cookie)
- **Request Body**:
  ```json
  {
    "long": "https://example.com/very/long/url",
    "expiry": "2024-12-31T23:59:59Z"  // Optional, defaults to 30 days from creation
  }
  ```
- **Response** (200 OK):
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
- **Error Responses**:
  - `400 Bad Request`: Invalid request body
  - `401 Unauthorized`: Missing or invalid authentication token
  - `500 Internal Server Error`: Failed to generate short URL or server error
- **Notes**:
  - Short URLs are 7 characters long using base62 encoding
  - Automatic collision detection with retry (up to 10 attempts)
  - Default expiration is 30 days if not specified

#### 7. Delete URL
- **DELETE** `/api/v1/delete`
- **Description**: Delete a short URL (only by the owner)
- **Authentication**: Required (JWT token in cookie)
- **Request Body**:
  ```json
  {
    "id": "url-uuid"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "message": "Url deleted successfully",
    "success": true
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid request body
  - `401 Unauthorized`: Missing or invalid authentication token
  - `404 Not Found`: URL not found or doesn't belong to user
  - `500 Internal Server Error`: Server error during deletion

### Monitoring

#### 8. Metrics Dashboard
- **GET** `/metrics`
- **Description**: Fiber monitor dashboard for real-time application metrics
- **Response**: HTML dashboard with metrics including:
  - Request statistics
  - Response times
  - Active connections
  - Memory usage
  - And more

## URL Generation

- **Encoding**: Base62 (characters: 0-9, a-z, A-Z)
- **Length**: 7 characters (provides 62^7 ≈ 3.5 trillion unique combinations)
- **Collision Detection**: Automatic retry mechanism (up to 10 attempts)
- **Atomicity**: Database transactions ensure thread-safe generation
- **Default Expiration**: 30 days from creation (if not specified)

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

- **Password Hashing**: bcrypt with cost factor 10 (industry standard)
- **JWT Tokens**: HS256 signing algorithm with configurable secret key
- **HTTP-Only Cookies**: Prevents XSS attacks by making cookies inaccessible to JavaScript
- **SameSite Cookie Policy**: Set to "Strict" to prevent CSRF attacks
- **Secure Cookies**: Automatically enabled in production environment (HTTPS only)
- **CORS Protection**: Configured for specific frontend origins via `APP_URL_FRONTEND`
- **Transaction Safety**: Database operations use transactions for atomicity and data consistency
- **Input Validation**: Request body validation and error handling
- **Token Expiration**: JWT tokens expire after 24 hours

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `APP_PORT` | Server port (with colon prefix, e.g., `:8080`) | `:8080` | Yes |
| `APP_HOST` | Server host address | `localhost` | Yes |
| `APP_ENV` | Environment mode (`development` or `production`) | - | Yes |
| `DOMAIN` | Domain for the API (e.g., `localhost:8080`) | - | Yes |
| `APP_URL_FRONTEND` | Frontend URL for CORS (e.g., `http://localhost:5173`) | - | Yes |
| `MYSQL_HOST` | MySQL host and port (e.g., `localhost:3306`) | - | Yes |
| `MYSQL_USER` | MySQL username | - | Yes |
| `MYSQL_PASS` | MySQL password | - | Yes |
| `MYSQL_DB` | MySQL database name | `url_shortener` | Yes |
| `REDIS_ADDR` | Redis address (e.g., `localhost:6379`) | - | Yes |
| `REDIS_PASS` | Redis password (leave empty if no password) | - | No |
| `JWT_SECRET` | Secret key for JWT token signing (use strong random string in production) | - | Yes |

**Note**: In production, ensure `JWT_SECRET` is a strong, randomly generated string. Never commit secrets to version control.

## Development

### Running in Development Mode

```bash
# Set environment variables (or use .env file)
export APP_ENV=development
export APP_PORT=:8080

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

### Docker Build

```bash
# Build Docker image
docker build -t url-shortener-api .

# Run container
docker run -p 3000:3000 --env-file .env url-shortener-api
```

### Database Migrations

The application automatically runs migrations on startup using GORM's `AutoMigrate` feature. Tables (`users` and `urls`) are created/updated automatically when the application starts. No manual migration steps are required.

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

- **Redis Caching**: 30-minute TTL reduces database load for frequently accessed URLs
- **Connection Pooling**: GORM automatically manages MySQL connection pooling
- **Transaction Management**: Ensures data consistency and prevents race conditions
- **Efficient URL Generation**: Base62 encoding with fast collision detection
- **Atomic Operations**: Database transactions prevent concurrent access issues
- **Indexed Queries**: GORM creates indexes on unique fields (email, short URL)
- **Soft Deletes**: Uses GORM soft deletes for data recovery capabilities

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running: `docker-compose ps` or `mysql -u root -p`
   - Check `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASS`, and `MYSQL_DB` environment variables
   - Ensure database exists: `CREATE DATABASE url_shortener;`

2. **Redis Connection Error**
   - Verify Redis is running: `docker-compose ps` or `redis-cli ping`
   - Check `REDIS_ADDR` environment variable
   - If Redis has a password, set `REDIS_PASS`

3. **Port Already in Use**
   - Change `APP_PORT` to a different port (e.g., `:8081`)
   - Or stop the process using the port: `lsof -ti:8080 | xargs kill`

4. **JWT Token Issues**
   - Ensure `JWT_SECRET` is set and consistent
   - Clear browser cookies if experiencing authentication issues
   - Check token expiration (24 hours)

5. **CORS Errors**
   - Verify `APP_URL_FRONTEND` matches your frontend URL exactly
   - Include protocol (http:// or https://) in the URL
   - Check browser console for specific CORS error messages

### Logs

View application logs in the terminal where the server is running. Logs include:
- Database connection status
- Redis connection status
- Request errors
- Server startup messages

For Docker deployments:
```bash
docker-compose logs -f api
```

## Testing

### Manual Testing with cURL

**Create User:**
```bash
curl -X POST http://localhost:8080/api/v1/create-user \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Shorten URL (with cookie):**
```bash
curl -X POST http://localhost:8080/api/v1/shorten \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"long":"https://example.com"}'
```

**Get All URLs:**
```bash
curl -X GET http://localhost:8080/api/v1/urls \
  -b cookies.txt
```

**Resolve Short URL:**
```bash
curl -L http://localhost:8080/abc1234
```

## API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "message": "Operation successful",
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "message": "Error description",
  "success": false,
  "error": "Detailed error message"
}
```

## Contributing

Contributions are welcome! Please feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

When contributing:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

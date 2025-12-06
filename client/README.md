# URL Shortener - React Client

A modern, responsive React application for managing shortened URLs, built with TypeScript, Vite, and Tailwind CSS.

## Features

- 🔐 **User Authentication**: Register and login with secure JWT-based authentication
- 📊 **Dashboard**: View all your shortened URLs in a responsive table
- ➕ **Create URLs**: Generate new short URLs via a user-friendly modal popup
- 🗑️ **Delete URLs**: Remove shortened URLs with confirmation
- 📱 **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- ⚠️ **Error Handling**: Clear error messages when API is unavailable
- 📋 **Copy to Clipboard**: One-click copy of short URLs

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing

## Prerequisites

- Node.js 18+ and npm
- Go API server running (see main project README)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API URL** (optional):
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:8080
   ```
   If not set, defaults to `http://localhost:8080`

3. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or the port Vite assigns)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/       # React components
│   ├── Login.tsx    # Login page
│   ├── Register.tsx # Registration page
│   ├── Dashboard.tsx # Main dashboard with URL table
│   ├── CreateUrlModal.tsx # Modal for creating new URLs
│   ├── ProtectedRoute.tsx # Route protection component
│   └── Toast.tsx    # Toast notification component
├── contexts/        # React contexts
│   └── AuthContext.tsx # Authentication context
├── services/        # API services
│   └── api.ts      # API client with error handling
├── types/          # TypeScript type definitions
│   └── index.ts    # Shared types
├── App.tsx         # Main app component with routing
└── main.tsx        # Entry point
```

## API Integration

The client communicates with the Go API server using:

- **Cookies**: Authentication tokens are stored in HTTP-only cookies
- **CORS**: Configured to work with the API server's CORS settings
- **Error Handling**: Graceful handling of network errors and API unavailability

### API Endpoints Used

- `POST /api/v1/create-user` - User registration
- `POST /api/v1/login` - User login
- `POST /api/v1/logout` - User logout
- `GET /api/v1/urls` - Get all user's URLs (protected)
- `POST /api/v1/shorten` - Create short URL (protected)
- `DELETE /api/v1/delete` - Delete URL (protected)

## Features in Detail

### Authentication

- Secure login and registration
- Session persistence using localStorage
- Automatic redirect to login if not authenticated
- Protected routes for dashboard

### Dashboard

- Responsive table displaying all shortened URLs
- Mobile-optimized layout (columns hide on smaller screens)
- Copy to clipboard functionality
- Delete with confirmation
- Empty state when no URLs exist

### URL Management

- Create new short URLs via modal popup
- View original and short URLs
- See creation dates
- One-click copy functionality
- Delete with confirmation dialog

## Error Handling

The application handles various error scenarios:

- **API Unavailable**: Shows clear error message when API server is down
- **Network Errors**: Displays user-friendly network error messages
- **Authentication Errors**: Redirects to login on 401 errors
- **Validation Errors**: Shows field-specific error messages

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory, ready to be served by any static file server.

## Environment Variables

- `VITE_API_URL` - Base URL for the API server (default: `http://localhost:8080`)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The app uses React Router for client-side routing
- Authentication state is managed via React Context
- API calls include credentials (cookies) for authentication
- All API errors are caught and displayed to users
- Responsive design uses Tailwind's mobile-first approach

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js Express backend application for Lush Co, using the traditional Express generator structure with Jade (now Pug) templating engine.

## Development Commands

### Starting the Server
```bash
npm start
```
Starts the server on port 3000 (or PORT environment variable if set). The server is defined in `bin/www`.

### Package Manager
This project uses **Bun** as its package manager (indicated by `bun.lock` file). Use `bun install` to install dependencies instead of `npm install`.

## Architecture

### Application Structure

- **Entry Point**: `bin/www` - HTTP server configuration and initialization
- **Application Config**: `app.js` - Express app setup, middleware configuration, and route registration
- **Routes**: `routes/` directory
  - `routes/index.js` - Root route handler (serves home page)
  - `routes/users.js` - User-related routes (mounted at `/users`)
- **Views**: `views/` directory - Jade template files
- **Public Assets**: `public/` directory - Static files (images, CSS, JavaScript)

### Middleware Stack (in order)

1. **morgan** ('dev') - HTTP request logger
2. **express.json()** - JSON body parser
3. **express.urlencoded()** - URL-encoded body parser (not extended)
4. **cookie-parser** - Cookie parsing
5. **express.static** - Static file serving from `public/`

### Route Organization

Routes are defined as Express Router modules and mounted in `app.js`:
- `/` → `routes/index.js`
- `/users` → `routes/users.js`

### Error Handling

- 404 errors: Caught by middleware at app.js:26-28
- General errors: Handled by error middleware at app.js:31-39
  - In development: Full error stack shown
  - In production: Only error message shown
  - Errors rendered via `error.jade` view

### View Engine

- **Template Engine**: Jade (legacy version ~1.11.0)
- **Views Directory**: `views/`
- Templates use Jade syntax, not the newer Pug syntax

## Key Dependencies

- **express** (~4.16.1) - Web framework
- **jade** (~1.11.0) - Template engine (legacy, consider upgrading to Pug)
- **morgan** - Request logging
- **cookie-parser** - Cookie handling
- **http-errors** - HTTP error creation
- **debug** - Debugging utility (namespace: 'lush-co-backend:server')

## Environment Configuration

- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Set to 'development' for detailed error pages

## API Documentation

### Postman Collection

**IMPORTANT**: Whenever you make major changes to the API (new routes, modified endpoints, changed request/response structures), you MUST create or update a Postman collection file.

Major changes include:
- Adding new routes or endpoints
- Modifying existing endpoint methods (GET, POST, PUT, DELETE, etc.)
- Changing request body schemas
- Updating response formats
- Adding or modifying authentication/authorization
- Creating new route files

The Postman collection should:
- Be saved as `postman_collection.json` in the project root
- Include all API endpoints with example requests
- Document request bodies, headers, and query parameters
- Include example responses
- Be organized by route modules (users, products, etc.)

## Notes for Future Development

- The server listens on all network interfaces (0.0.0.0)
- Debug logging uses the namespace 'lush-co-backend:server' - enable with `DEBUG=lush-co-backend:server npm start`
- Jade is deprecated; consider migrating to Pug for new features

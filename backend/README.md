# Backend Documentation


## Technology Stack

- **Framework**: FastAPI (v0.111.0)
- **Database**: 
  - Peewee ORM with support for SQLite (default) and other databases
  - Database migrations handled via peewee-migrate
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time Communication**: Socket.IO for WebSocket connections
- **OAuth Support**: Google, Microsoft, and OIDC providers
- **File Handling**: Support for various document formats (PDF, DOCX, PPTX, etc.)

## Architecture

### Directory Structure

```
backend/
├── apps/
│   ├── socket/         # WebSocket handling
│   │   └── main.py     # Socket.IO server implementation
│   └── webui/          # Main web application
│       ├── internal/   # Database layer
│       │   ├── db.py   # Database connection and setup
│       │   └── migrations/ # Database migrations
│       ├── models/     # Data models
│       │   ├── auths.py   # Authentication models
│       │   ├── users.py   # User models
│       │   └── files.py   # File models
│       └── routers/    # API endpoints
│           ├── auths.py   # Authentication endpoints
│           ├── users.py   # User management endpoints
│           ├── files.py   # File upload/download endpoints
│           ├── configs.py # Configuration endpoints
│           └── utils.py   # Utility endpoints
├── utils/              # Utility functions
│   ├── utils.py        # Authentication utilities
│   ├── webhook.py      # Webhook integration
│   └── misc.py         # Miscellaneous utilities
├── data/               # Application data
│   ├── cache/          # Cache directory
│   ├── uploads/        # File uploads
│   └── webui.db        # SQLite database (default)
├── static/             # Static assets
├── main.py             # Main application entry point
├── config.py           # Configuration management
└── constants.py        # Application constants
```

## Core Components

### 1. Main Application (`main.py`)

The main FastAPI application that:
- Configures CORS middleware for cross-origin requests
- Mounts sub-applications for WebSocket (`/ws`) and API (`/api/v1`) endpoints
- Handles OAuth authentication flow
- Serves static files and frontend build
- Provides system endpoints like `/api/config`, `/api/version`, `/manifest.json`

### 2. Configuration System (`config.py`)

Sophisticated configuration management with:
- **PersistentConfig**: A generic class that manages configuration values from both environment variables and a JSON config file
- **Environment-based settings**: Supports development, test, and production environments
- **OAuth configuration**: Automatic setup for Google, Microsoft, and OIDC providers
- **Security settings**: JWT expiration, session cookies, authentication headers
- **Feature flags**: Enable/disable signup, community sharing, admin export

### 3. Authentication System

#### Models (`apps/webui/models/auths.py`)
- User authentication with email/password
- OAuth integration with provider-specific subject IDs
- API key management for programmatic access

#### Router (`apps/webui/routers/auths.py`)
- `/api/v1/auths/` - Get current session user
- `/api/v1/auths/signin` - User login
- `/api/v1/auths/signup` - User registration
- `/api/v1/auths/update/profile` - Update user profile
- `/api/v1/auths/update/password` - Change password
- OAuth endpoints handled in main.py:
  - `/oauth/{provider}/login` - Initiate OAuth flow
  - `/oauth/{provider}/callback` - Handle OAuth callback

#### Security Features
- JWT token-based authentication with configurable expiration
- Support for trusted header authentication (for reverse proxy setups)
- Role-based access control (admin, user, pending)
- API key authentication as an alternative to JWT

### 4. User Management

#### Models (`apps/webui/models/users.py`)
- User profiles with customizable settings
- Last active tracking
- OAuth subject linking
- User roles and permissions

#### Router (`apps/webui/routers/users.py`)
- `/api/v1/users/` - List all users (admin only)
- `/api/v1/users/update/role` - Update user role (admin only)
- `/api/v1/users/user/settings` - Get/update user settings
- `/api/v1/users/permissions/user` - Manage user permissions

### 5. File Management

#### Models (`apps/webui/models/files.py`)
- File metadata storage
- User ownership tracking
- Content type and size tracking

#### Router (`apps/webui/routers/files.py`)
- `/api/v1/files/` - Upload files
- `/api/v1/files/{file_id}` - Get/delete files
- `/api/v1/files/` - List user files
- Support for various file formats through document processing libraries

### 6. WebSocket Communication (`apps/socket/main.py`)

Real-time features using Socket.IO:
- User presence tracking (online/offline status)
- Active user count broadcasting
- Model usage tracking
- Session pool management
- Automatic cleanup with timeout handling

Key events:
- `connect` - User connects to WebSocket
- `user-join` - User joins with authentication
- `user-count` - Broadcast active user count
- `usage` - Track model usage across users
- `disconnect` - Handle user disconnection

### 7. Database Layer

#### Database Setup (`apps/webui/internal/db.py`)
- Flexible database support through Peewee ORM
- Default SQLite with option for PostgreSQL, MySQL
- Automatic migration from legacy "ollama.db" to "webui.db"
- JSON field support for flexible data storage

#### Migrations
- Automated database schema migrations
- Located in `apps/webui/internal/migrations/`

### 8. Utility Functions

#### Authentication Utils (`utils/utils.py`)
- Password hashing and verification (bcrypt)
- JWT token creation and validation
- API key generation
- User verification decorators
- Role-based access control helpers

#### Webhook Integration (`utils/webhook.py`)
- Support for multiple webhook platforms:
  - Slack
  - Discord
  - Microsoft Teams
  - Google Chat
- Event-based notifications for user signup and other actions

## API Endpoints Summary

### Public Endpoints
- `GET /` - API status
- `GET /api/config` - Application configuration
- `GET /api/version` - Version information
- `GET /api/changelog` - Recent changelog entries
- `GET /health` - Health check
- `GET /manifest.json` - PWA manifest
- `GET /opensearch.xml` - OpenSearch description

### Authentication Required
- User management endpoints under `/api/v1/users/`
- File operations under `/api/v1/files/`
- Configuration updates under `/api/v1/configs/`
- Profile management under `/api/v1/auths/`

### Admin Only
- User role updates
- User listing
- Permission management
- Webhook configuration

## Security Features

1. **Authentication Methods**:
   - JWT tokens with configurable expiration
   - API keys for programmatic access
   - OAuth 2.0 (Google, Microsoft, OIDC)
   - Trusted header authentication for reverse proxy setups

2. **Password Security**:
   - Bcrypt hashing with salt
   - Password strength validation
   - Secure password reset flow

3. **Session Management**:
   - HTTP-only cookies for JWT storage
   - Configurable session cookie settings (SameSite, Secure)
   - Automatic session cleanup

4. **Access Control**:
   - Role-based permissions (admin, user, pending)
   - User-specific file access
   - Admin-only endpoints protection

## Configuration

The application uses a two-tier configuration system:

1. **Environment Variables**: Primary configuration source
2. **config.json**: Persistent configuration that can be modified at runtime

Key configuration options:
- `WEBUI_AUTH`: Enable/disable authentication
- `ENABLE_SIGNUP`: Allow new user registration
- `JWT_EXPIRES_IN`: JWT token expiration time
- `DATABASE_URL`: Database connection string
- `OAUTH_*`: OAuth provider settings
- `WEBHOOK_URL`: External webhook endpoint

## Deployment

### Development
```bash
# Using the provided script
./dev.sh
```

### Production
```bash
# Unix/Linux
./start.sh

# Windows
start_windows.bat
```

### Requirements
- Python 3.8+
- All dependencies in `requirements.txt`
- Optional: PostgreSQL/MySQL for production database

## Integrations

1. **Document Processing**:
   - PDF handling with pypdf
   - Office documents (DOCX, PPTX) support
   - OCR capabilities with RapidOCR
   - Markdown rendering

2. **External Services**:
   - Webhook notifications to Slack, Discord, Teams
   - OAuth authentication providers
   - YouTube transcript extraction
   - Web search capabilities (DuckDuckGo)

3. **AI/ML Features**:
   - Sentence transformers for embeddings
   - ChromaDB for vector storage
   - Whisper integration for audio transcription
   - Support for various LLM integrations

## Notes

- Supports both standalone deployment and integration with existing services
- Includes extensive logging configuration for debugging
- Designed for scalability with support for multiple database backends
- Real-time features through WebSocket connections
- Comprehensive file handling with security measures (UUID-based naming, type validation)
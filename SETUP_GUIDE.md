# Commit to Kids - Setup Guide

This guide will help you quickly set up and run the full stack application with a Python/FastAPI backend and Next.js frontend.

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.9 or higher) - We recommend using Anaconda/Miniconda
- **Git**

## Python Setup with Anaconda/Miniconda

### Installing Miniconda (Recommended)

1. Download Miniconda from [https://docs.conda.io/en/latest/miniconda.html](https://docs.conda.io/en/latest/miniconda.html)
2. Install following your OS instructions
3. Verify installation:
   ```bash
   conda --version
   ```

### Create Python Environment

```bash
# Create a new conda environment with Python 3.11
conda create -n commit-to-kids python=3.11

# Activate the environment
conda activate commit-to-kids
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Python Dependencies

With your conda environment activated:

```bash
pip install -r requirements.txt
```

### 3. Configuration

The backend will create a default configuration file on first run. You can modify `data/config.json` later if needed.

### 4. Start the Backend Server

#### Option A: Development Mode (Unix/Mac/Linux)
```bash
./dev.sh
```

#### Option B: Production Mode (Unix/Mac/Linux)
```bash
./start.sh
```

#### Option C: Windows
```bash
start_windows.bat
```

#### Option D: Direct Python
```bash
python main.py
```

The backend server will run on `http://localhost:8080` by default.

## Frontend Setup

### 1. Navigate to Frontend Directory

Open a new terminal and:

```bash
cd frontend
```

### 2. Install Node Dependencies

```bash
npm install
```

### 3. Environment Configuration (Optional)

Create a `.env.local` file in the frontend directory if you need to customize settings:

```env
# API Configuration (defaults shown)
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# App Configuration
NEXT_PUBLIC_APP_NAME=OpenBook
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_SIGNUP=true
NEXT_PUBLIC_ENABLE_OAUTH=false

# File Upload Settings
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/*,application/pdf,text/*
```

### 4. Start the Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Quick Start Commands Summary

### Backend (with conda activated)
```bash
cd backend
conda activate commit-to-kids
pip install -r requirements.txt
./dev.sh  # or python main.py
```

### Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/docs (FastAPI automatic docs)

## Development Tools

### Frontend Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

### Backend Logging

- Backend logs are saved to `backend/backend.log`
- Frontend logs are saved to `frontend/frontend.log`

## Database

The application uses SQLite by default with the database file located at:
- `backend/data/webui.db`

## Troubleshooting

### Port Already in Use

If ports 3000 or 8080 are already in use:

**Backend**: Edit `backend/config.py` to change the port
**Frontend**: Run with a different port:
```bash
npm run dev -- -p 3001
```

### Python Dependencies Issues

If you encounter dependency conflicts:
```bash
# Recreate the conda environment
conda deactivate
conda remove -n commit-to-kids --all
conda create -n commit-to-kids python=3.11
conda activate commit-to-kids
pip install -r requirements.txt
```

### Node Dependencies Issues

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Additional Notes

- The backend uses FastAPI with automatic API documentation
- The frontend uses Next.js 15 with TypeScript and Tailwind CSS
- WebSocket support is included for real-time features
- Authentication is handled via JWT tokens

## Support

For issues or questions, please check the project repository or create an issue.
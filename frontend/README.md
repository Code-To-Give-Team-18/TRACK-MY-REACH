# Frontend - Next.js Application

A production-ready Next.js application with TypeScript, Tailwind CSS, and modern best practices, integrated with a FastAPI backend for authentication and API services.

## 🚀 Tech Stack

- **Framework:** Next.js 15.5 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **3D Graphics:** Three.js with React Three Fiber
- **State Management:** Zustand with persistence
- **Authentication:** JWT-based with cookie storage
- **API Client:** Axios with interceptors
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Code Quality:** ESLint, Prettier, Husky, Commitlint

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                  # App router pages and layouts
│   │   ├── (auth)/           # Auth group routes (public)
│   │   │   ├── login/        # Login page
│   │   │   ├── signup/       # Registration page
│   │   │   └── forgot-password/ # Password reset
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── profile/      # User profile
│   │   │   └── settings/     # User settings
│   │   ├── test-auth/        # Authentication testing page
│   │   ├── three-demo/       # Three.js demonstration page
│   │   ├── layout.tsx        # Root layout with providers
│   │   ├── page.tsx          # Home page
│   │   ├── error.tsx         # Error boundary
│   │   ├── loading.tsx       # Loading state
│   │   └── not-found.tsx     # 404 page
│   ├── components/           # Reusable components
│   │   ├── ui/              # Base UI components
│   │   ├── features/        # Feature-specific components
│   │   ├── layout/          # Layout components
│   │   ├── auth/            # Auth components
│   │   └── three/           # Three.js/3D components
│   ├── lib/                  # Utility functions and shared logic
│   │   └── axios.ts         # Configured axios instance
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API services
│   │   └── auth.service.ts  # Authentication service
│   ├── stores/               # Zustand stores
│   │   └── auth.store.ts    # Authentication state
│   ├── providers/            # React context providers
│   │   ├── auth-provider.tsx # Auth state provider
│   │   └── query-provider.tsx # React Query provider
│   ├── types/                # TypeScript type definitions
│   ├── config/               # App configuration
│   │   └── env.ts           # Environment variables
│   └── middleware.ts         # Next.js middleware for auth
├── public/                   # Static assets
├── .husky/                   # Git hooks
└── [config files]            # Various configuration files
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables (if .env.example exists)
cp .env.example .env.local 2>/dev/null || echo "No .env.example found, creating .env.local"

# Update .env.local with your backend URL (default: http://localhost:8080)
# NEXT_PUBLIC_API_URL=http://localhost:8080

# Run development server
npm run dev
```

### Three.js Setup (Already Installed)

The Three.js dependencies are already installed. If you need to reinstall them:

```bash
# For Next.js 15 with React 19
npm install three @react-three/fiber@rc @react-three/drei

# TypeScript types
npm install --save-dev @types/three
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Backend Setup

Ensure the FastAPI backend is running on port 8080:

```bash
cd ../backend
./start.sh  # or python main.py
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript compiler check
```

## 🎮 Three.js Integration

### Overview

The application includes Three.js for 3D graphics rendering, using React Three Fiber (R3F) as the React renderer and @react-three/drei for helpful utilities and abstractions.

### Dependencies

- **three**: Core Three.js library for 3D graphics
- **@react-three/fiber**: React renderer for Three.js (using RC version for Next.js 15 compatibility)
- **@react-three/drei**: Collection of useful helpers and abstractions for R3F
- **@types/three**: TypeScript definitions for Three.js

### Basic Usage

Create 3D scenes as React components using the Canvas component:

```tsx
'use client';  // Required for Three.js components in Next.js app router

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';

export default function My3DScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box>
        <meshStandardMaterial color="orange" />
      </Box>
      <OrbitControls />
    </Canvas>
  );
}
```

### Example Scene

Visit `/three-demo` to see an interactive 3D scene with:
- Clickable and hoverable 3D objects
- Camera orbit controls
- Dynamic lighting
- Material effects

### Creating 3D Components

1. **Always use 'use client' directive** for components with Three.js
2. **Place 3D components in `src/components/three/`** for organization
3. **Wrap scenes in Canvas component** from @react-three/fiber
4. **Use TypeScript** for better type safety with Three.js objects

Example component structure:
```tsx
// src/components/three/MyModel.tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function MyModel() {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}
```

### Performance Considerations

- Use `React.memo()` for complex 3D components
- Implement LOD (Level of Detail) for complex models
- Use instancing for repeated geometries
- Optimize textures and models before importing
- Consider using `@react-three/drei`'s performance helpers

### Common Patterns

#### Loading 3D Models
```tsx
import { useGLTF } from '@react-three/drei';

function Model() {
  const { scene } = useGLTF('/model.glb');
  return <primitive object={scene} />;
}
```

#### Animation with useFrame
```tsx
import { useFrame } from '@react-three/fiber';

function AnimatedBox() {
  const ref = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime);
    }
  });
  
  return <mesh ref={ref}>...</mesh>;
}
```

#### Interaction Events
```tsx
function InteractiveObject() {
  const [hovered, setHover] = useState(false);
  const [clicked, setClick] = useState(false);
  
  return (
    <mesh
      scale={clicked ? 1.5 : 1}
      onClick={() => setClick(!clicked)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}
```

## 🔐 Authentication

### Overview

The application uses JWT-based authentication with the FastAPI backend:

- **Token Storage**: Dual storage in localStorage and HTTP-only cookies
- **State Management**: Zustand store with persistence
- **Route Protection**: Middleware-based for SSR, client-side checks for CSR
- **Auto Refresh**: Axios interceptors handle token expiration

### Authentication Flow

1. **Login/Signup**: User credentials sent to `/api/v1/auths/signin` or `/api/v1/auths/signup`
2. **Token Storage**: JWT stored in both localStorage and cookies
3. **Protected Routes**: Middleware checks cookie, client checks Zustand state
4. **API Requests**: Axios automatically attaches Bearer token
5. **Token Expiry**: 401 responses trigger automatic logout

### Testing Authentication

Visit `/test-auth` for a dedicated authentication testing interface:

```bash
# Default test credentials
Email: test@example.com
Password: TestPassword123
```

## 🎨 Development Guidelines

### Component Structure

```tsx
// src/components/features/UserProfile.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface UserProfileProps {
  userId: string;
  initialData?: User;
}

export function UserProfile({ userId, initialData }: UserProfileProps) {
  // Component logic
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### File Naming Conventions

- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Utilities/Hooks:** camelCase (e.g., `useAuth.ts`, `formatDate.ts`)
- **Types:** PascalCase with `.types.ts` extension (e.g., `User.types.ts`)
- **Services:** camelCase with `.service.ts` extension (e.g., `auth.service.ts`)

### State Management

```tsx
// Using Zustand for global state
import { create } from 'zustand';

interface StoreState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### Data Fetching

```tsx
// Using TanStack Query
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/services/user.service';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Form Handling

```tsx
// Using React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## 🎯 Best Practices

### 1. **Component Organization**
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into custom hooks
- Colocate related files (component + styles + tests)

### 2. **TypeScript**
- Always define prop types with interfaces
- Use type inference when possible
- Avoid `any` type - use `unknown` if type is truly unknown
- Export types separately from components

### 3. **Performance**
- Use React.memo() for expensive components
- Implement code splitting with dynamic imports
- Optimize images with Next.js Image component
- Use `loading.tsx` and `error.tsx` for better UX

### 4. **Styling with Tailwind**
- Use semantic color variables from tailwind.config.ts
- Create reusable component variants with CVA
- Avoid inline styles - use Tailwind classes
- Use `clsx` or `cn` utility for conditional classes

### 5. **API Integration**
```tsx
// Centralized API configuration with authentication
// src/lib/axios.ts
import axios from 'axios';
import { env } from '@/config/env';

export const apiClient = axios.create({
  baseURL: `${env.API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 6. **Error Handling**
- Use error boundaries for component errors
- Implement proper error states in data fetching
- Log errors to monitoring service (e.g., Sentry)
- Provide user-friendly error messages

### 7. **Testing Strategy**
```tsx
// Component testing example
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
});
```

### 8. **Environment Variables**

```bash
# .env.local
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# App Configuration
NEXT_PUBLIC_APP_NAME=OpenBook
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_SIGNUP=true
NEXT_PUBLIC_ENABLE_OAUTH=false
```

- Use `.env.local` for local development
- Never commit sensitive data
- Prefix client-side vars with `NEXT_PUBLIC_`
- Type your environment variables in `src/config/env.ts`

### 9. **Git Workflow**
```bash
# Feature branch workflow
git checkout -b feature/user-authentication
# Make changes
git add .
git commit -m "feat: add user authentication"
git push origin feature/user-authentication
# Create PR for review
```

### 10. **Code Quality**
- Pre-commit hooks run automatically via Husky
- Commits must follow Conventional Commits format
- All code is auto-formatted with Prettier
- ESLint catches potential issues

## 🔒 Security Best Practices

1. **Authentication & Authorization**
   - JWT tokens with configurable expiration (default: 24 hours)
   - Dual storage: localStorage for client, cookies for SSR
   - Automatic token cleanup on logout or expiry
   - Middleware-based route protection
   - Role-based access control (admin, user, pending)

2. **Data Validation**
   - Always validate user input on both client and server
   - Use Zod schemas for runtime validation
   - Sanitize data before rendering

3. **Security Headers**
   - Middleware adds security headers automatically
   - CSP headers prevent XSS attacks
   - CORS properly configured

4. **Sensitive Data**
   - Never log sensitive information
   - Use environment variables for secrets
   - Implement rate limiting for API calls

## 📦 Deployment

### Production Build

```bash
# Build the application
npm run build

# Test production build locally
npm run start
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Build passes without errors
- [ ] All tests passing
- [ ] Security headers configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] Performance monitoring enabled
- [ ] SSL/TLS configured
- [ ] CDN configured for static assets
- [ ] Database migrations complete

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔧 Troubleshooting

### Common Issues

#### Authentication Issues

1. **Login redirect loop**
   - Clear browser cookies and localStorage
   - Ensure backend is running on correct port
   - Check CORS configuration in backend

2. **401 Unauthorized errors**
   ```bash
   # Clear auth data
   localStorage.clear()
   document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
   ```

3. **Backend connection issues**
   - Verify backend is running: `curl http://localhost:8080/api/config`
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Ensure CORS is enabled in backend (`origins = ["*"]`)

### Other Common Issues

1. **Module not found errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules .next
   npm install
   ```

2. **TypeScript errors**
   ```bash
   # Check for type errors
   npm run type-check
   ```

3. **Tailwind styles not applying**
   - Check `content` paths in `tailwind.config.ts`
   - Ensure classes aren't dynamically constructed
   - Restart dev server

## 📚 Resources

### Project Documentation
- [Backend README](../backend/README.md) - FastAPI backend documentation
- [API Documentation](http://localhost:8080/docs) - Interactive API docs (when backend is running)

### Technology Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Axios](https://axios-http.com/docs/intro) - HTTP client

## 📄 License

This project is private and proprietary.

## 🚀 Quick Start Guide

### 1. Start the Backend
```bash
cd ../backend
./start.sh  # Runs on http://localhost:8080
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

### 3. Test Authentication
- Visit http://localhost:3000/test-auth
- Use test credentials or create a new account
- Navigate to /dashboard after login

### 4. Available Routes

**Public Routes:**
- `/` - Home page
- `/login` - User login
- `/signup` - User registration
- `/forgot-password` - Password reset
- `/test-auth` - Authentication testing
- `/three-demo` - Three.js interactive 3D demonstration

**Protected Routes:**
- `/dashboard` - User dashboard
- `/profile` - User profile management
- `/settings` - Application settings

---

Built with ❤️ using Next.js and TypeScript, integrated with FastAPI backend
# Todo App - Full-Stack Task Management 📝

A modern, full-featured Todo application built with React, TypeScript, Node.js, and Fastify. Features a beautiful UI, advanced task management capabilities, and excellent performance.

![Todo App](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)

## 🌟 Features

### ✨ Core Features
- **CRUD Operations**: Create, read, update, and delete tasks
- **Task Completion**: Mark tasks as complete/incomplete with visual feedback
- **Priority Levels**: High, Medium, Low priority with color coding
- **Due Dates**: Set and track task deadlines with overdue warnings
- **Tags System**: Organize tasks with customizable colored tags
- **Search & Filter**: Real-time search with advanced filtering options
- **Sorting**: Sort by date, priority, or custom order
- **Drag & Drop**: Reorder tasks with smooth animations

### 🎯 Advanced Features
- **Bulk Actions**: Select multiple tasks for batch operations
- **View Modes**: All, Today, Upcoming, Completed, High Priority
- **Dark/Light Mode**: Theme switching with system preference detection
- **Responsive Design**: Mobile-first, works perfectly on all devices
- **Real-time Updates**: Optimistic UI with instant feedback
- **Virtual Scrolling**: Handle 1000+ tasks smoothly
- **Offline Support**: Basic offline functionality (planned)

### 🚀 Performance & UX
- **Debounced Search**: 250ms delay with intelligent caching
- **Virtual Scrolling**: Handle 1000+ tasks smoothly with @tanstack/react-virtual
- **Infinite Scroll**: Load more data as you scroll for large datasets
- **Optimistic Updates**: Instant UI feedback before server confirmation
- **Memoized Components**: React.memo and useMemo for preventing re-renders
- **Service Worker**: Offline support with background sync
- **Performance Monitor**: Real-time FPS, memory, and render time tracking
- **Smart Caching**: Multi-layer caching with cache invalidation
- **Network-aware**: Adapts behavior based on connection speed
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Skeleton screens and loading indicators
- **Accessibility**: Full keyboard navigation and screen reader support

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Vite**: Lightning-fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible component library
- **TanStack Query**: Server state management with caching
- **Zustand**: Lightweight client state management
- **React Router**: Client-side routing
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form**: Form validation and handling
- **Zod**: Runtime type validation

### Backend (Node.js + TypeScript)
- **Fastify**: Fast and low overhead web framework
- **Prisma**: Next-generation ORM with type safety
- **SQLite/PostgreSQL**: Database with easy switching
- **Zod**: Schema validation for API endpoints
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Protection against abuse

### DevOps & Tooling
- **pnpm Workspaces**: Monorepo management
- **ESLint & Prettier**: Code quality and formatting
- **Vitest**: Fast unit testing
- **Playwright**: End-to-end testing
- **Docker**: Containerization for deployment
- **GitHub Actions**: CI/CD pipeline (coming soon)

## 📁 Project Structure

```
todo-app-monorepo/
├── apps/
│   ├── api/                 # Backend API
│   │   ├── src/
│   │   │   ├── routes/      # API routes
│   │   │   ├── schemas/     # Validation schemas
│   │   │   ├── config/      # Configuration
│   │   │   └── index.ts     # Main server file
│   │   ├── prisma/          # Database schema & migrations
│   │   └── package.json
│   └── web/                 # Frontend React app
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── hooks/       # Custom hooks
│       │   ├── lib/         # Utilities
│       │   ├── pages/       # Page components
│       │   ├── store/       # State management
│       │   └── types/       # TypeScript types
│       └── package.json
├── packages/                # Shared packages (if any)
├── docker-compose.yml       # Docker orchestration
├── pnpm-workspace.yaml     # Workspace configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher (recommended) or npm
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cd apps/api
   cp env.example .env
   
   # Edit .env with your settings:
   # DATABASE_URL="file:./dev.db"
   # PORT=3001
   # NODE_ENV=development
   ```

4. **Initialize database**
   ```bash
   # Generate Prisma client
   pnpm --filter api db:generate
   
   # Run migrations
   pnpm --filter api db:migrate
   
   # Seed with demo data
   pnpm seed
   ```

5. **Start development servers**
   ```bash
   # Start both frontend and backend
   pnpm dev
   
   # Or start individually:
   # pnpm --filter api dev    # Backend on http://localhost:3001
   # pnpm --filter web dev    # Frontend on http://localhost:5173
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## 📝 Available Scripts

### Root Level
- `pnpm dev` - Start both frontend and backend in development mode
- `pnpm build` - Build both applications for production
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm format` - Format all code

### Backend (API)
- `pnpm --filter api dev` - Start API server in development mode
- `pnpm --filter api build` - Build API for production
- `pnpm --filter api start` - Start production API server
- `pnpm --filter api test` - Run API tests
- `pnpm --filter api db:migrate` - Run database migrations
- `pnpm --filter api db:studio` - Open Prisma Studio
- `pnpm --filter api seed` - Seed database with demo data

### Frontend (Web)
- `pnpm --filter web dev` - Start development server
- `pnpm --filter web build` - Build for production
- `pnpm --filter web preview` - Preview production build
- `pnpm --filter web test` - Run unit tests
- `pnpm --filter web e2e` - Run end-to-end tests

## 🐳 Docker Deployment

### Development
```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
# Build and start production services
docker-compose up --build
```

The application will be available at `http://localhost:3000`

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm --filter web test --watch
```

### End-to-End Tests
```bash
# Run E2E tests
pnpm --filter web e2e

# Run E2E tests with UI
pnpm --filter web e2e:ui
```

## 🎨 Customization

### Themes
The app supports light, dark, and system themes. Theme preference is persisted in localStorage.

### Colors
Customize colors by editing the CSS variables in `apps/web/src/globals.css`.

### Components
All components are built with shadcn/ui and can be easily customized or replaced.

## 📊 Database Schema

### Tasks Table
- `id` - Unique identifier (CUID)
- `title` - Task title (required)
- `description` - Optional task description
- `completed` - Boolean completion status
- `priority` - Integer (1=High, 2=Medium, 3=Low)
- `dueDate` - Optional due date
- `orderIndex` - For custom sorting
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Tags Table
- `id` - Unique identifier (CUID)
- `name` - Tag name (unique)
- `color` - Color identifier

### TaskTags Table
- Junction table for many-to-many relationship
- `taskId` - Foreign key to tasks
- `tagId` - Foreign key to tags

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL="file:./dev.db"           # SQLite for development
# DATABASE_URL="postgresql://..."      # PostgreSQL for production
PORT=3001                              # API server port
NODE_ENV=development                   # Environment
CORS_ORIGIN="http://localhost:5173"    # Frontend URL
RATE_LIMIT_MAX=100                     # Requests per window
RATE_LIMIT_WINDOW=60000                # Rate limit window (ms)
```

### Database Switching
To switch from SQLite to PostgreSQL:

1. Update `DATABASE_URL` in `.env`
2. Change `provider` in `prisma/schema.prisma` to `postgresql`
3. Run migrations: `pnpm --filter api db:migrate`

## 🚀 Deployment

### Recommended Platforms

#### Frontend (Vercel/Netlify)
1. Connect your Git repository
2. Set build command: `pnpm build --filter web`
3. Set output directory: `apps/web/dist`
4. Set environment variables for API URL

#### Backend (Railway/Render/Fly.io)
1. Use the included `Dockerfile` in `apps/api`
2. Set environment variables
3. Configure PostgreSQL database
4. Run migrations on deployment

#### Full-Stack (Docker)
Use the included `docker-compose.yml` for complete deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write tests for new features
- Update documentation for API changes
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [TanStack Query](https://tanstack.com/query) for excellent data fetching
- [Prisma](https://prisma.io/) for the amazing ORM
- [Fastify](https://fastify.io/) for the fast web framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📈 Roadmap

- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Task templates
- [ ] Team workspaces
- [ ] Advanced analytics
- [ ] Offline support
- [ ] Email notifications
- [ ] API rate limiting improvements
- [ ] Advanced search with filters

---

**Built with ❤️ using React, TypeScript, and modern web technologies.**

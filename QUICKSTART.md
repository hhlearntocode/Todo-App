# 🚀 Quickstart Guide - Todo App

Get the Todo App running in under 5 minutes!

## Prerequisites ⚡

- **Node.js** 18+ 
- **pnpm** 8+ (recommended) or npm
- **Git**

## Quick Setup 🏃‍♂️

### 1. Install Dependencies
```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 2. Setup Backend Database
```bash
# Generate Prisma client
pnpm --filter api db:generate

# Create and run migrations
pnpm --filter api db:migrate

# Seed with demo data (50+ tasks)
pnpm seed
```

### 3. Start Development Servers
```bash
# Start both frontend and backend
pnpm dev
```

### 4. Open Your Browser 🌐
Navigate to **http://localhost:5173**

**Backend API:** http://localhost:3001/health

## What You'll See 🎉

- **50+ Demo Tasks** with various priorities, tags, and due dates
- **Beautiful UI** with dark/light mode toggle
- **Drag & Drop** task reordering
- **Search & Filter** functionality with smart caching
- **Bulk Actions** for managing multiple tasks
- **Virtual Scrolling** for smooth performance with large datasets
- **Performance Monitor** (development mode) showing FPS, memory usage
- **Responsive Design** that works on all devices
- **Offline Support** with Service Worker caching

## Quick Tour 🗺️

1. **Create a Task**: Click "New Task" button in the header
2. **Toggle Completion**: Click the checkbox next to any task
3. **Edit Task**: Click the menu (⋯) on any task → Edit
4. **Filter Tasks**: Use the sidebar (All, Today, Upcoming, etc.)
5. **Search**: Type in the search box in the header
6. **Bulk Actions**: Select multiple tasks with checkboxes
7. **Drag & Drop**: Grab the handle (⋮⋮) to reorder tasks
8. **Theme Toggle**: Click the theme button in the header

## Available Scripts 📜

```bash
# Development
pnpm dev              # Start both frontend & backend
pnpm --filter api dev # Start backend only
pnpm --filter web dev # Start frontend only

# Database
pnpm seed            # Add demo data
pnpm --filter api db:studio  # Open Prisma Studio

# Build & Test
pnpm build           # Build for production
pnpm test            # Run tests
pnpm lint            # Check code quality
```

## Troubleshooting 🔧

### Port Already in Use
If you see port errors:
```bash
# Kill processes on default ports
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

### Database Issues
```bash
# Reset database
rm apps/api/dev.db
pnpm --filter api db:migrate
pnpm seed
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules apps/*/node_modules
rm pnpm-lock.yaml
pnpm install
```

## Docker Quick Start 🐳

If you prefer Docker:
```bash
# Development mode
docker-compose -f docker-compose.dev.yml up

# Production mode
docker-compose up --build
```

## What's Included 📦

✅ **50+ Demo Tasks** with realistic data  
✅ **Full CRUD Operations** - Create, Read, Update, Delete  
✅ **Advanced Filtering** - By status, priority, tags, dates  
✅ **Search Functionality** - Real-time search with debouncing  
✅ **Drag & Drop Reordering** - Smooth animations  
✅ **Bulk Actions** - Select and modify multiple tasks  
✅ **Tag System** - Organize with colored tags  
✅ **Priority Levels** - High, Medium, Low with visual indicators  
✅ **Due Dates** - With overdue warnings  
✅ **Dark/Light Themes** - Auto-detects system preference  
✅ **Responsive Design** - Mobile-first approach  
✅ **Optimistic Updates** - Instant UI feedback  
✅ **Error Handling** - Comprehensive error boundaries  
✅ **Type Safety** - Full TypeScript coverage  

## Next Steps 🎯

- Explore the codebase structure
- Read the full README.md for detailed documentation
- Check out the API endpoints at http://localhost:3001/health
- Customize the theme and colors
- Add your own tasks and start organizing!

## Need Help? 💬

- Check the full README.md for detailed documentation
- Look at the component files in `apps/web/src/components/`
- Examine API routes in `apps/api/src/routes/`
- Use Prisma Studio to explore the database: `pnpm --filter api db:studio`

**Happy task managing! 📝✨**

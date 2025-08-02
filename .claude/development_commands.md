## Development Commands

### Core Development
```bash
./start.sh                      # Start both frontend (5173) and backend (6969) servers
npm run dev                     # Start Vite development server only (port 5173)
npm start                       # Start backend server only (port 6969)
npm run build                   # Production build (TypeScript + Vite)
npm run preview                 # Preview production build (port 4173)
```

### Code Quality & Security
```bash
npm run lint                    # Run ESLint + Prettier checks
npm run lint:fix                # Auto-fix linting issues
npm run format                  # Format code with Prettier
npm run type-check              # TypeScript-only type checking
```
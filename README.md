# The Business Lexicon Lock

A real-time multi-player word search game for Ngee Ann Polytechnic's Open House, designed to engage visitors and showcase the Diploma in Business Studies program.

## ✨ Features

✅ **Multi-player Support** - Up to 8 players compete simultaneously  
✅ **Real-time Synchronization** - Instant updates across all devices  
✅ **Mobile Optimized** - Touch controls for smartphones and tablets  
✅ **Central Display** - Live dashboard for audience engagement  
✅ **Business Education** - 12+ DBS-related vocabulary words  
✅ **Fast-paced Gameplay** - Configurable difficulty levels (60-120 seconds)  
✅ **Professional Design** - NP branding and modern UI  
✅ **Sound Effects** - Audio feedback for game events  

## 🚀 Quick Start

### For Event Hosts

1. Open the application and navigate to `/host`
2. Click "Create New Game Session"
3. Share the 6-character code with players
4. Wait for players to join
5. Click "Start Game" when ready

### For Players

1. Visit the application homepage
2. Enter the session code
3. Enter your name
4. Start playing when the host begins

## 📋 Prerequisites

- Node.js 22 or higher
- pnpm package manager
- MySQL database (for backend)
- Modern web browser

## 💻 Development Setup

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/business-lexicon-lock.git
cd business-lexicon-lock

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local

# Update .env.local with your database URL:
# DATABASE_URL=mysql://user:password@localhost:3306/business_lexicon_lock
```

### Database Setup

```bash
# Push schema to database
pnpm db:push

# Generate migrations (if needed)
pnpm db:generate
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Next.js/Frontend-heavy)

1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

```bash
# One-click deployment via Vercel CLI
npm i -g vercel
vercel
```

### Option 2: Railway (Full Stack with Database)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add MySQL plugin
5. Set `DATABASE_URL` environment variable
6. Deploy

### Option 3: Render (Full Stack Alternative)

1. Sign up at [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repository
4. Set build command: `pnpm install && pnpm build`
5. Set start command: `pnpm start`
6. Add environment variables
7. Deploy

### Option 4: GitHub Pages (Frontend Only - Static Hosting)

⚠️ **Note**: This requires a static site. For your full-stack game, use Options 1-3.

If you want to host just the frontend:

```bash
# Build static site
pnpm build

# Install gh-pages
pnpm add -D gh-pages

# Add to package.json:
# "deploy": "gh-pages -d dist"

# Deploy
pnpm deploy
```

Update your `vite.config.ts`:
```typescript
export default {
  base: '/business-lexicon-lock/',
  // ...rest of config
}
```

## 🔐 Environment Variables

Create `.env.local` file:

```plaintext
// filepath: c:\Users\barba\OneDrive\Documents\1. Open House\App for 8 Players with Mobile Access and Linking\.env.example
# Database
DATABASE_URL=mysql://user:password@localhost:3306/business_lexicon_lock

# Server
NODE_ENV=development
PORT=5173

# Optional: API keys, OAuth credentials, etc.
```

**Never commit `.env.local` to GitHub!** It's already in `.gitignore`.

## 📁 Project Structure

```
business-lexicon-lock/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/        # JoinGame, PlayerGame, HostDashboard
│   │   ├── components/   # WordSearchGrid, UI components
│   │   ├── hooks/        # useSound, custom hooks
│   │   ├── types/        # TypeScript definitions
│   │   └── lib/          # tRPC, utilities
│   └── public/
│       └── assets/       # NP logo, images
├── server/                # Backend API
│   ├── gameRouter.ts     # Game endpoints
│   ├── gameData.ts       # Word lists, config
│   ├── gridGenerator.ts  # Grid algorithm
│   └── db.ts             # Database functions
├── drizzle/
│   └── schema.ts         # Database schema
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
├── README.md             # This file
└── SETUP_GUIDE.md        # Detailed setup
```

## 🎮 Game Configuration

Edit `server/gameData.ts` to customize:

```typescript
// Word difficulty levels
DIFFICULTY_CONFIGS = {
  easy: { wordCount: 8, duration: 120 },
  medium: { wordCount: 12, duration: 90 },
  hard: { wordCount: 15, duration: 60 },
}

// Maximum players per session
MAX_PLAYERS: 8

// Points per word
POINTS_PER_WORD: 10

// Available business terms
BUSINESS_WORDS_POOL: [...]
```

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Test connection
mysql -u user -p -h localhost

# Check DATABASE_URL format
mysql://username:password@host:3306/database_name
```

### Port Already in Use
```bash
# Change port in vite.config.ts
server: {
  port: 3000, // Change to available port
}
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

## 📊 API Endpoints

- `POST /api/game.createSession` - Create new game
- `POST /api/game.joinSession` - Join as player
- `POST /api/game.startGame` - Start game timer
- `POST /api/game.submitWord` - Submit found word
- `GET /api/game.getGameState` - Get game state
- `POST /api/game.endGame` - End game

## 🎨 Customization

### Update Game Content
Edit `/server/gameData.ts`:
- Change `BUSINESS_WORDS_POOL` array
- Modify clues
- Adjust difficulty levels
- Change player colors

### Update Branding
- Replace `/public/assets/np-logo.png` with your logo
- Update colors in Tailwind config
- Change title in HTML/components

## 📝 License

Created for Ngee Ann Polytechnic's Diploma in Business Studies Open House.

## 🤝 Support

For setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

For issues, create a GitHub issue with:
- Error message
- Steps to reproduce
- Environment details (OS, Node version, etc.)

## 📞 Contact

For questions about the game, contact the BS team at Ngee Ann Polytechnic.
Vibe coded by Barbara Yam, with the help of Manus AI (watch the replay here: https://manus.im/share/pL1jKIjI2JhO3fzjMvCO8T?replay=1) and Github Co-Pilot

---

**Made with ❤️ for Ngee Ann Polytechnic**

# The Business Lexicon Lock - Setup Guide

## Overview

The Business Lexicon Lock is a real-time multi-player word search game designed for Ngee Ann Polytechnic's Open House. Up to 8 players can compete simultaneously on their mobile devices while a central display shows live progress.

## Game Features

- **Multi-player Support**: Up to 8 players per game session
- **Real-time Synchronization**: All players see word discoveries instantly
- **Mobile Optimized**: Touch controls for easy mobile gameplay
- **90-Second Challenge**: Fast-paced competitive gameplay
- **Business Terms**: 12 DBS-related vocabulary words with clues
- **Live Leaderboard**: Real-time score tracking
- **Central Display**: Large screen dashboard for audience engagement

## Setup Instructions

### For the Open House Event

#### 1. Host Setup (Laptop/Desktop with Projector)

1. Open the application in a web browser
2. Navigate to the **Host Dashboard** by clicking "Create New Game"
3. Click "Create New Game Session"
4. A 6-character session code will be displayed prominently
5. Share this code with players (display on screen, write on whiteboard, etc.)
6. Wait for players to join (you'll see them appear in the player list)
7. Once ready, click "Start Game" to begin the 90-second challenge
8. The central display shows:
   - Shared word search grid
   - Live player scores and colors
   - Timer countdown
   - Words found in real-time
   - Leaderboard

#### 2. Player Setup (Mobile Devices)

1. Players scan QR code or visit the game URL on their mobile devices
2. Enter the 6-character session code displayed on the central screen
3. Enter their name
4. Click "Join Game"
5. Wait for the host to start the game
6. Once started, players can:
   - Tap and drag to select words on the grid
   - See their score update in real-time
   - View clues that reveal actual words when found
   - Compete with other players

## Game Flow

### Pre-Game (Waiting Room)
- Host creates session and displays session code
- Players join using the code
- Host can see all joined players
- Maximum 8 players per session

### During Game (90 seconds)
- All players compete on the same word search grid
- Players tap/swipe to select words
- When a word is found:
  - The player who found it gets 10 points
  - The word is highlighted on all screens
  - The clue is replaced with the actual word
- Timer counts down from 90 seconds
- Scores update in real-time

### Post-Game
- Final scores are displayed
- Leaderboard shows rankings
- Host can start a new game session

## Technical Details

### Game Configuration

The game uses 12 business terms:
1. FINTECH - The fusion of finance and technology
2. DATA - Raw facts and figures for analysis
3. STRATEGY - A plan of action to achieve goals
4. MARKETING - The study of markets and promotion
5. ENTREPRENEUR - Someone who starts a business venture
6. HUMANCAPITAL - The skills and knowledge of workers
7. LOGISTICS - Managing the flow of goods
8. ANALYTICS - Systematic analysis of data
9. ADAPTATION - Adjusting to new conditions
10. INNOVATION - Introducing new ideas or methods
11. RISK - Potential for loss or uncertainty
12. ETHICS - Moral principles in business

### Grid Specifications
- Size: 12x12 grid
- Words placed in horizontal, vertical, and diagonal directions
- Empty cells filled with random letters
- Each game generates a unique grid

### Scoring System
- 10 points per word found
- First player to find a word gets the points
- No penalties for incorrect selections

## Troubleshooting

### Players Can't Join
- Verify the session code is correct
- Check that the session hasn't already started
- Ensure maximum 8 players hasn't been reached

### Game Not Starting
- Ensure at least one player has joined
- Check that the host clicked "Start Game"

### Words Not Registering
- Ensure players select from start to end letter in a straight line
- Words must be at least 3 letters long
- Check that the word hasn't already been found

### Real-time Updates Not Working
- Ensure all devices have stable internet connection
- Try refreshing the browser if updates stop

## Tips for Open House

1. **Pre-load the host dashboard** before visitors arrive
2. **Display the session code prominently** on the projector
3. **Have a QR code ready** for quick mobile access
4. **Prepare multiple sessions** for continuous gameplay
5. **Encourage team play** - visitors can work together
6. **Highlight the business terms** - educational aspect for DBS promotion
7. **Keep sessions moving** - 90 seconds is quick, have next group ready

## URLs

- **Player Join Page**: `/` (home page)
- **Host Dashboard**: `/host`
- **Player Game**: `/play/:sessionId/:playerId` (auto-navigated after joining)

## Browser Compatibility

- Chrome/Edge (recommended)
- Safari (iOS)
- Firefox
- Mobile browsers (iOS Safari, Chrome Android)

## Support

For technical issues during the event, check:
1. Internet connectivity
2. Browser console for errors
3. Database connection status
4. Session expiry (create new session if needed)

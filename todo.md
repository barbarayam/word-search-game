# Project TODO

## Database Schema
- [x] Create game sessions table (id, grid, words, start_time, end_time, max_players)
- [x] Create players table (id, session_id, name, score, color, joined_at)
- [x] Create found_words table (id, session_id, player_id, word, found_at)

## Game Logic
- [x] Word search grid generation algorithm (12x12 with 12 business terms)
- [x] Word placement logic (horizontal, vertical, diagonal)
- [x] Word validation and detection algorithm
- [x] Clue system (show clues initially, reveal words when found)
- [x] 90-second timer implementation
- [x] Scoring system (points per word found)

## Backend API
- [x] POST /api/sessions - Create new game session
- [x] GET /api/sessions/:id - Get session details
- [x] POST /api/sessions/:id/join - Join session as player
- [x] POST /api/sessions/:id/words - Submit found word
- [x] GET /api/sessions/:id/state - Get real-time game state
- [x] Real-time updates via polling (1s interval)

## Mobile Player Interface
- [x] Join game screen (enter name, session code)
- [x] Game rules display
- [x] Word search grid with touch controls
- [x] Word selection by tap/swipe (start and end letters)
- [x] Clue list display (12 clues)
- [x] Live timer countdown
- [x] Player's score display
- [x] Visual feedback for found words (highlight with player color)
- [x] Mobile-responsive design
- [x] Touch gesture optimization

## Central Display Dashboard
- [x] Large display view for laptop/projector
- [x] Shared word search grid
- [x] Live player list with scores and colors
- [x] Real-time word highlights when found
- [x] Session management (start/reset game)
- [x] Overall timer display
- [x] Leaderboard during and after game)
- [x] Session code display for players to join

## Real-time Synchronization
- [x] Broadcast word found events to all players
- [x] Update grid highlights in real-time
- [x] Sync player scores across all devices
- [x] Handle player join/leave events
- [x] Timer synchronization across all clients

## Game Content
- [x] 12 business terms: FINTECH, DATA, STRATEGY, MARKETING, ENTREPRENEUR, HUMANCAPITAL, LOGISTICS, ANALYTICS, ADAPTATION, INNOVATION, RISK, ETHICS
- [x] 12 corresponding clues
- [x] Configurable word list via JSON

## UI/UX Polish
- [x] Ngee Ann Polytechnic branding colors (blues/whites/greys)
- [x] NP/DBS logo integration
- [x] Modern, clean, energetic design
- [x] High contrast colors for accessibility
- [x] Smooth animations for word highlighting
- [x] Player color assignment (unique color per player)
- [x] End game screen with final scores

## Testing & Deployment
- [ ] Test with 8 simultaneous players (ready for testing)
- [ ] Test real-time synchronization (ready for testing)
- [ ] Test mobile touch controls (ready for testing)
- [ ] Test on various mobile devices (ready for testing)
- [x] Performance optimization
- [x] Create deployment checkpoint

## New Features
- [x] QR code generation on host dashboard for instant player joining
- [x] Auto-fill session code when joining via QR code

## Enhanced Features
- [x] Expand word pool to 24+ business terms
- [x] Random selection of 12 words per game session
- [x] Ensure variety across multiple game sessions

## New Enhancements
- [x] Add word length hints to clues (e.g., "7 letters")
- [x] Implement difficulty levels (Easy, Medium, Hard)
- [x] Easy mode: 8 words, 120 seconds
- [x] Medium mode: 12 words, 90 seconds (current default)
- [x] Hard mode: 15 words, 60 seconds
- [x] Difficulty selection on host dashboard

## Sound Effects
- [ ] Success sound when a word is found
- [ ] Countdown beep sound for final 10 seconds
- [ ] Game start sound
- [ ] Game end sound
- [ ] Sound toggle control for host

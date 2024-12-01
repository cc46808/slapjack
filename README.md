# slapjack/README.md
# Slapjack Multiplayer Game

Real-time multiplayer card game implementation using WebSocket.

## Features
- Real-time multiplayer gameplay
- AI players
- Game state persistence
- Reconnection handling
- Performance monitoring
- Security measures

## Tech Stack
- Frontend: React, Vite, TailwindCSS
- Backend: Node.js, WebSocket
- Database: PostgreSQL, Redis
- Infrastructure: Docker, AWS ECS

## Development Setup
1. Install dependencies:
```bash
# Backend
cd server && npm install
```
```bash
# Frontend
cd client && npm install
```

# Start development servers:

```bash
# Backend
cd server && npm run dev
```
```bash
# Frontend
cd client && npm run dev
```

# Production Deployment

Configure environment variables
Build and deploy:

```bash
docker-compose up -d
```
# Testing
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# E2E tests
cd client && npm run test:e2e
```
# Contributing
- Fork repository
- Create feature branch
- Submit pull request

# License
- MIT
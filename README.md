# VoteLive

**Real-time poll & voting app with live-updating charts.**

Create polls, share a link, and watch results come in instantly -- powered by WebSockets.

![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-9.0-512BD4?logo=dotnet)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **Create Polls** -- Add a question with up to 10 options, single or multiple choice
- **Share via Link** -- Every poll gets a unique short code, no sign-up required to vote
- **Real-time Results** -- Votes appear instantly via SignalR WebSocket connections
- **Beautiful Charts** -- Bar charts, donut charts, and animated progress bars (Recharts)
- **Modern UI** -- Dark theme, Tailwind CSS, responsive design
- **Dockerized** -- One command to run the entire stack

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS 4, Recharts |
| **Backend** | ASP.NET Core 9 Minimal API, SignalR |
| **Database** | PostgreSQL 16 with EF Core |
| **Cache/Realtime** | Redis 7 (SignalR backplane) |
| **Infrastructure** | Docker Compose, Nginx |

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

### Run

```bash
git clone https://github.com/juljanblischke/VoteLive.git
cd VoteLive
docker compose up --build
```

Open **http://localhost:3000** in your browser.

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Development

Run the backend and frontend separately for hot-reload:

```bash
# Terminal 1 -- Start Postgres & Redis
docker compose up postgres redis

# Terminal 2 -- Backend
dotnet run

# Terminal 3 -- Frontend
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/hubs` to the backend automatically.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/polls` | Create a new poll |
| `GET` | `/api/polls/{shareCode}` | Get poll details |
| `POST` | `/api/polls/{shareCode}/vote` | Cast a vote |
| `GET` | `/api/polls/{shareCode}/results` | Get vote results |

### SignalR Hub

Connect to `/hubs/poll` and join a poll group to receive real-time `VoteUpdate` events.

## Project Structure

```
VoteLive/
├── Program.cs              # API endpoints & app config
├── Models/                 # Poll, Option, Vote entities & DTOs
├── Data/                   # EF Core DbContext
├── Hubs/                   # SignalR PollHub
├── Migrations/             # EF Core database migrations
├── Dockerfile              # Backend multi-stage build
├── docker-compose.yml      # Full stack orchestration
│
└── client/                 # React frontend
    ├── src/
    │   ├── pages/          # Home, Create, Vote, Results
    │   ├── components/ui/  # Button, Card, Input
    │   ├── lib/            # API client, SignalR hook, utils
    │   └── index.css       # Tailwind theme
    ├── Dockerfile          # Frontend multi-stage build
    └── nginx.conf          # Reverse proxy config
```

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## License

MIT

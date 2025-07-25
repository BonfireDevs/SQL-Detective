# SQL Detective

A gamified platform for learning SQL by solving mystery cases.

## Features

- Interactive SQL query tutorials
- Detective-style game narrative
- Safe SQL execution environment (SELECT-only, sandboxed)
- Progressive difficulty cases
- Schema visualization
- **Hint system** for each clue
- **Badges & Achievements** (JOIN Master, Speed Runner, Perfect Case, etc.)
- **Leaderboard** (solve time, username)
- **SQL Reference Panel**
- **Clue log** and case notebook

## Technologies

- Frontend: React.js with Tailwind CSS
- Editor: Monaco Editor
- Backend: Node.js (Express)
- Database: SQLite (per case)
- Docker for full-stack deployment

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for frontend development)

### Running with Docker

1. Clone the repository
2. Run `docker-compose build` to build both services
3. Run `docker-compose up`
4. Access the app at `http://localhost:3000`

### Running Locally (Dev Mode)

#### Backend (Node.js/Express)

1. Navigate to `backend` directory
2. Install dependencies: `npm install`
3. Run server: `npm start` (runs on port 8000)

#### Frontend (React)

1. Navigate to `frontend` directory
2. Install dependencies: `npm install`
3. Run development server: `npm start` (runs on port 3000)

## Project Structure

- `backend/`: Node.js Express application
  - `cases/`: SQLite database files for each case
  - `server.js`: Main application file
  - `Dockerfile`: Backend Docker build
- `frontend/`: React application
  - `src/components/`: Reusable UI components (QueryEditor, ResultsTable, ClueLog, StatusPanel, BadgesPanel, LeaderboardPanel, SQLReferencePanel)
  - `src/pages/`: Application pages (HomePage, CasePage, TutorialPage)
  - `Dockerfile`: Frontend Docker build
- `docker-compose.yml`: Docker configuration

## Gameplay Overview

- Select a case and solve clues by writing SQL queries.
- Use the Monaco SQL editor to submit queries.
- Unlock clues, use hints (with leaderboard penalty), and track your progress.
- Earn badges for SQL mastery, speed, and more.
- Compete on the leaderboard by solving cases quickly and efficiently.
- Use the SQL Reference panel for help.

## License

MIT
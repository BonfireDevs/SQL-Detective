# SQL Detective

A gamified platform for learning SQL by solving mystery cases.

## Features

- Interactive SQL query tutorials
- Detective-style game narrative
- Safe SQL execution environment
- Progressive difficulty cases
- Schema visualization

## Technologies

- Frontend: React.js with Tailwind CSS
- Editor: Monaco Editor
- Backend: FastAPI (Python)
- Database: SQLite (per case)

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for frontend development)
- Python 3.9+ (for backend development)

### Running with Docker

1. Clone the repository
2. Run `docker-compose up`
3. Access the app at `http://localhost:3000`

### Running Locally

#### Backend

1. Navigate to `backend` directory
2. Create virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run server: `uvicorn main:app --reload`

#### Frontend

1. Navigate to `frontend` directory
2. Install dependencies: `npm install`
3. Run development server: `npm start`

## Project Structure

- `backend/`: FastAPI application
  - `cases/`: SQLite database files for each case
  - `main.py`: Main application file
- `frontend/`: React application
  - `src/components/`: Reusable UI components
  - `src/pages/`: Application pages
- `docker-compose.yml`: Docker configuration

## License

MIT
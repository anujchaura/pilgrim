# Finance Data Automation & Dashboard

This project is a mini finance automation system built with Django + React that processes raw financial data, performs reconciliation between bank statements and internal ledgers, stores structured ledger entries, and visualizes the data in a beautiful React dashboard.

## Tech Stack
- **Backend**: Python, Django, Django REST Framework, PostgreSQL
- **Frontend**: React (Vite), Recharts, Vanilla CSS, Lucide React
- **Infrastructure**: Docker, Docker Compose, Redis (prepared for Celery)

## Features Included
✅ **Data Ingestion**: Upload bank statement and internal ledger CSV files via API/Frontend.
✅ **Reconciliation Logic**: Matches transactions exactly by amount, <= 2 days date diff, and fuzzy string matching on descriptions.
✅ **Ledger Automation**: Creates normalized ledger entries tracking `bank` or `internal` sources and categorization.
✅ **APIs**: Exposes `/summary`, `/reconciliation`, and `/category-breakdown` endpoints.
✅ **Dashboard**: Sleek, dark-mode React frontend to upload files, view reconciliation status, and chart expenses.
✅ **Bonus: Auto-categorization**: Basic substring rule-engine assigning categories like "Food", "Travel", "Cloud/Hosting", etc.
✅ **Bonus: Docker Setup**: Ready to use `docker-compose` environment with PostgreSQL database.

## How to Run Locally (Without Docker)

### Backend
1. Open terminal in the `backend` folder.
2. Activate your virtual environment and install packages: `pip install -r requirements.txt`.
3. Run migrations: `python manage.py migrate`.
4. Run server: `python manage.py runserver`.

### Frontend
1. Open terminal in the `frontend` folder.
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev`.

## How to Run with Docker (Recommended)
Make sure you have Docker Desktop installed.
1. Run `docker-compose up --build` from the root project directory.
2. The backend will be available at `http://localhost:8000`.
3. The frontend will be available at `http://localhost:5173`.

## Sample Files
You can find `bank_statement.csv` and `internal_ledger.csv` in the root directory. Use these in the "Data Import" tab on the frontend.

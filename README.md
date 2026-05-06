# Finance Automation System

This is a finance data automation project built using Django and React. It takes bank statements and internal ledgers, reconciles the transactions, and displays the data on a web dashboard.

## Setup Instructions

### Backend Setup
1. Go to the `backend` folder.
2. Install the required python packages:
   ```
   pip install -r requirements.txt
   ```
3. Run the database migrations:
   ```
   python manage.py migrate
   ```
4. Start the development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup
1. Go to the `frontend` folder.
2. Install the node packages:
   ```
   npm install
   ```
3. Start the react app:
   ```
   npm run dev
   ```

## Features
- Upload CSV files for bank statements and internal ledgers
- Reconciles data based on amount, date (within 2 days), and description string similarity
- Dashboard to view expenses and summary
- Export reconciliation data to CSV and PDF

## Docker
If you want to run the project using Docker, just run:
```
docker-compose up --build
```

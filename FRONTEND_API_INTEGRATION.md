# SheSparks Frontend ↔ Backend integration

## What changed
- `backend/server.js` serves the `frontend` folder from the same origin as the API.
- `frontend/js/api.js` is a shared API client at `window.SheSparksAPI`.
- `frontend/views/course.html` and `frontend/js/course.js` load courses from `GET /api/courses` and submit enrollment to `POST /api/courses/enroll`.
- Reports now call routes that actually exist in this Backend:
  - Report 1: `/api/rooms/available`, `/api/equipments/available`, `/api/trainers/available`
  - Report 2: `/api/members`, `/api/members/:id/points`, `/api/rewards`
  - Report 3: `/api/reports/courses`, `/api/reports/revenue`

## Run it
1. In `backend`, copy `.env.example` to `.env` and set the MySQL password/database.
2. Run `npm install` if needed.
3. Run `npm run dev`.
4. Open `http://localhost:3000/views/index.html` (not the HTML file directly).
5. Sign in using an account that your existing login flow recognizes. Reports still require an admin role in localStorage.

## Important
- The project login flow and several other pages still use hardcoded/local mock data. This patch connects the course page and reports, but does not mean every page in the entire site has been migrated to database-backed authentication/data yet.
- API results come from MySQL only when the database connection succeeds. If a request returns an SQL error, check the terminal and confirm your schema/table/column names match the controllers.
- `.env` is intentionally excluded from this exported ZIP. Create it locally from `.env.example`.


## Prerequisites

- Node.js (LTS) and npm
- Java 17+
- Maven 3.9+
- MySQL 8.x
- Angular CLI (optional): `npm i -g @angular/cli`

## Quick Start

1) Database
- Start MySQL.
- Run the Windows script to create the database and user:
  - Double-click [setup-mysql.bat](cci:7://file:///c:/Users/ASUS/Desktop/csr%20module/setup-mysql.bat:0:0-0:0) or run in terminal:
    - [setup-mysql.bat](cci:7://file:///c:/Users/ASUS/Desktop/csr%20module/setup-mysql.bat:0:0-0:0)
- Ensure MySQL credentials match your local setup.

2) Backend (Spring Boot)
- Configure [backend/src/main/resources/application.properties](cci:7://file:///c:/Users/ASUS/Desktop/csr%20module/backend/src/main/resources/application.properties:0:0-0:0):
  - `spring.datasource.url=jdbc:mysql://localhost:3306/csr?...`
  - `spring.datasource.username=...`
  - `spring.datasource.password=...`
  - Gmail SMTP (optional for email) — use an app password:
    - `spring.mail.username=your@gmail.com`
    - `spring.mail.password=your_app_password`
- Start the server:
  - `cd backend`
  - `mvn spring-boot:run`
- Server runs on http://localhost:8080

3) Frontend (Angular)
- Configure Firebase in [frontend/src/environments/firebase.ts](cci:7://file:///c:/Users/ASUS/Desktop/csr%20module/frontend/src/environments/firebase.ts:0:0-0:0):
  - Fill in `firebaseConfig` and `actionCodeSettings.url = 'http://localhost:4200/verify'`
- Install and run:
  - `cd frontend`
  - `npm install`
  - `npm start` (or `ng serve`)
- App runs on http://localhost:4200

## Environment Configuration

- Backend: [backend/src/main/resources/application.properties](cci:7://file:///c:/Users/ASUS/Desktop/csr%20module/backend/src/main/resources/application.properties:0:0-0:0)
  - Spring port: `server.port=8080`
  - DB: `spring.datasource.*`
  - Hibernate: `spring.jpa.hibernate.ddl-auto=update`
  - Mail: `spring.mail.*` (optional; use app passwords for Gmail)
- Frontend: [frontend/src/environments/firebase.ts](cci:7://file:///c:/Users/ASUS/Desktop/csr%20module/frontend/src/environments/firebase.ts:0:0-0:0)
  - `firebaseConfig`: Firebase project credentials
  - `actionCodeSettings.url`: must match `http://localhost:4200/verify`

Important: Do not commit real secrets (DB passwords, mail passwords, Firebase keys that are not meant to be public). Use environment variables or an externalized config in production.

## Backend API

Base URL: `http://localhost:8080/api`

- Users
  - POST `/users/upsert`
    - Body:
      ```json
      {
        "name": "Full Name",
        "username": "username",
        "profession": "Engineer",
        "email": "user[example.com",](cci:4://file://example.com",:0:0-0:0)
        "verifiedAt": "2025-01-01T10:00:00Z"
      }
      ```
    - Upserts by email.
  - DELETE `/users/by-email?email=user@example.com`
    - Deletes a user by email (204 on success, 404 if not found).
  - GET `/users/health` → ok

- Notifications
  - GET `/notifications?email=...` or system-wide listing
  - POST `/notifications` to save
  - PATCH `/notifications/mark-all-read?email=...`

- Audit Events
  - POST `/audit` to log an event (e.g., LOGIN)
  - GET `/audit?email=...` to list

## Frontend Highlights

- Firebase email-link verification
  - Login → Send verification link
  - Verify page reads the link and upserts the user to backend.
- Employees and Volunteers
  - Stored in localStorage (demo). Deletions persist in localStorage.
  - On employee removal, backend user record is also deleted by email (if available).
- Projects
  - Advanced Add/Edit dialog: smart validation, quick budgets, quick dates, templates, auto status.
  - Stored in localStorage (demo). Can be wired to backend if needed.
- Reports
  - Date range uses Material datepickers.
  - Export CSV button retained (others removed per requirement).

## Running Scripts

- Frontend:
  - `npm start` — run dev server on 4200
  - `npm run build` — production build
- Backend:
  - `mvn spring-boot:run`
  - `mvn clean package` — build JAR

## Troubleshooting

- Port conflicts:
  - Ensure 8080 (backend) and 4200 (frontend) are free.
- MySQL connection errors:
  - Verify DB exists (`csr`), user/password match.
  - Check `allowPublicKeyRetrieval=true` if using MySQL 8 with native auth.
- Firebase email link not working:
  - Confirm `actionCodeSettings.url` equals `http://localhost:4200/verify`
  - Make sure the domain is authorized in Firebase console.
- Gmail SMTP:
  - Use an app password; normal Gmail password won’t work with 2FA enabled.

## Development Notes

- Angular uses standalone components; routes in [src/app/app.routes.ts](cci:7://file:///c:/Users/ASUS/Desktop/csr%20module/frontend/src/app/app.routes.ts:0:0-0:0).
- CORS enabled for `http://localhost:4200` on the backend.
- Entities auto-created with `spring.jpa.hibernate.ddl-auto=update` (dev only).

## Roadmap (Optional)

- Wire Projects CRUD to Spring Boot with REST endpoints.
- Replace localStorage volunteers/employees with backend persistence.
- Add audit emit on successful login/verify.
- Deploy to cloud (Netlify for frontend, Render/Heroku for backend).
- Docker compose for DB + backend + frontend.

## License

This project is provided as-is for demonstration and internal use. Adapt license as needed (MIT/Apache-2.0/etc).

## Screenshots

- Login (advanced UI with strength meter)
- Projects (advanced dialog)
- Reports (CSV export, date range pickers)
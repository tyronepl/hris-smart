# HRIS Smart

An AI-powered Human Resource Information System (HRIS) for managing employee records and resumes.

The system provides employee CRUD operations, resume uploads, and AI-assisted resume parsing to automatically extract employee information.

## Features

* Employee management

  * Create employees
  * View employee details
  * Update employee information
  * Delete employees
  * Search employees
* Resume management

  * Upload PDF and DOCX resumes
  * Store employee resumes
  * Extract text from resumes
* AI resume parsing

  * Automatically extract information from resumes
  * Populate employee fields from parsed resume data
* Authentication

  * JWT-based API authentication
* Responsive web interface

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Axios
* Lucide React

### Backend

* NestJS
* TypeScript
* REST API
* JWT Authentication
* Multer
* PDF Parse
* Mammoth

### AI / Automation

* n8n
* Ollama
* AI-powered resume processing

### Database

* MySQL

## Project Structure

```text
hris-smart/
├── frontend/
│   └── app/
│       └── employees/
│           ├── page.tsx
│           └── components/
│               ├── EmployeeViewModal.tsx
│               ├── EmployeeFormModal.tsx
│               └── EmployeeTable.tsx
│
└── backend/
    ├── src/
    │   ├── employees/
    │   ├── auth/
    │   └── ...
    └── uploads/
        └── resumes/
```

## Requirements

Make sure the following are installed:

* Node.js 20+
* npm
* MySQL
* n8n
* Ollama

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd hris-smart
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file and configure the required environment variables.

Example:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=hris

JWT_SECRET=your_jwt_secret

N8N_WEBHOOK_URL=http://localhost:5678/webhook/resume-autofill
```

Start the backend:

```bash
npm run start:dev
```

The API will run on:

```text
http://localhost:3000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:3001
```

## Resume Processing Flow

The resume processing workflow works as follows:

```text
User uploads resume
        ↓
Frontend sends resume to NestJS
        ↓
NestJS extracts resume text
        ↓
NestJS sends extracted text to n8n
        ↓
n8n processes the resume using AI
        ↓
Structured employee information is returned
        ↓
Frontend automatically fills employee fields
        ↓
User reviews the information
        ↓
Employee record is saved
```

## Supported Resume Formats

AI resume parsing supports:

* PDF
* DOCX

Maximum AI parsing file size:

```text
10 MB
```

Resume storage uploads are limited to:

```text
5 MB
```

## API Endpoints

### Employees

| Method | Endpoint                  | Description               |
| ------ | ------------------------- | ------------------------- |
| GET    | `/employees`              | Get all employees         |
| GET    | `/employees/:id`          | Get an employee           |
| POST   | `/employees`              | Create an employee        |
| PATCH  | `/employees/:id`          | Update an employee        |
| DELETE | `/employees/:id`          | Delete an employee        |
| POST   | `/employees/resume/parse` | Parse a resume with AI    |
| POST   | `/employees/:id/resume`   | Upload an employee resume |

All employee endpoints require JWT authentication.

## Security

* JWT authentication for protected API endpoints
* File type validation for resume uploads
* File size limits
* Server-side validation
* Resume files stored outside the frontend application

## Development

Run the backend:

```bash
cd backend
npm run start:dev
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Make sure MySQL, n8n, and Ollama are running before testing the complete resume-processing workflow.

## Future Improvements

* Employee profile photos
* Role-based access control
* Employee dashboard and analytics
* Resume version history
* Advanced employee filtering
* AI-powered candidate matching
* Automated interview question generation
* Email notifications
* Cloud storage integration

## License

This project is for demonstration and development purposes.

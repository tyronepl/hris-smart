# HRIS Smart

An AI-powered Human Resource Information System (HRIS) for managing employees, attendance, leave, overtime, payroll, resumes, and HR operations.

HRIS Smart provides a centralized web-based platform for HR teams to manage employee records and automate common HR processes. It also includes AI-assisted resume parsing using n8n and Ollama to extract structured employee information from uploaded resumes.

---

## Features

### Employee Management

- Create employee records
- View employee details
- Update employee information
- Delete employees
- Search and filter employees
- Upload employee resumes
- View stored resume information

### Resume Management

- Upload PDF and DOCX resumes
- Resume file validation
- Resume text extraction
- Store employee resumes
- AI-assisted resume parsing
- Automatically populate employee information from parsed resumes

### AI Resume Parsing

- Extract structured information from resumes
- Parse:
  - Name
  - Contact information
  - Address
  - Skills
  - Work experience
  - Education
- Uses n8n for workflow automation
- Uses Ollama for local AI processing

### Authentication

- JWT-based authentication
- Protected API endpoints
- HR user registration and login
- Account profile management
- Password change

### Attendance Management

- Create attendance records
- View attendance records
- Update attendance records
- Delete attendance records
- Employee attendance history
- Employee attendance calendar
- Attendance statuses:
  - Present
  - Late
  - Absent

### Leave Management

- Create leave requests
- View leave requests
- Update leave status
- Approve leave requests
- Reject leave requests
- Cancel leave requests
- Delete leave requests
- Leave types:
  - Vacation
  - Sick
  - Emergency
  - Other
- Automatic calculation of leave days

### Absence Management

- Create absence records
- View absence records
- Update absence records
- Delete absence records
- Employee-specific absence records

> Absence Management is currently maintained separately from Attendance. Approved absences can be integrated with Attendance in the future without duplicating absence records.

### Overtime Management

- Create overtime records
- View overtime records
- Update overtime records
- Approve overtime
- Reject overtime
- Delete overtime records
- Employee-specific overtime records

### Payroll Management

- Create payroll records
- View payroll records
- Approve payroll
- Mark payroll as paid
- Delete payroll records
- Automatic payroll calculations
- Gross pay calculation
- Overtime pay
- Holiday pay
- Night differential
- Allowances
- Bonuses
- Statutory deductions
- Other deductions
- Net pay calculation
- Generate downloadable PDF payslips

### Calendar

- Create calendar events
- View calendar events
- Update calendar events
- Delete calendar events
- View events by year

### Audit Logs

- Track important HR system activities
- Record create, update, delete, approve, reject, cancel, and payment actions
- Track authentication activities
- Track employee resume uploads
- View audit history
- Filter audit logs by:
  - User
  - Employee
  - Action
  - Module
  - Description
- View detailed audit log information

### Dashboard

- Total employee count
- Present employees
- Late employees
- Absent employees
- Pending leave requests
- Pending overtime requests
- Payroll summary
- Attendance overview
- Leave request statistics
- Payroll overview
- Recent HR activities

### Responsive Web Interface

- Responsive dashboard
- Sidebar navigation
- Search and filtering
- Modal-based forms
- Data tables
- Employee management interface
- HR dashboard and analytics

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- Lucide React
- Recharts

### Backend

- NestJS
- TypeScript
- REST API
- JWT Authentication
- Passport
- TypeORM
- Multer
- PDF Parse
- Mammoth
- PDFKit

### AI / Automation

- n8n
- Ollama
- AI-powered resume processing

### Database

- MySQL

### Infrastructure

- Docker
- Docker Compose
- Linux
- Nginx
- AWS-compatible deployment environment

---

## Project Structure

```text
hris-smart/
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   └── DashboardLayout/
│   │   │
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ├── leaves/
│   │   ├── absences/
│   │   ├── overtime/
│   │   ├── payroll/
│   │   ├── calendar/
│   │   ├── audit-logs/
│   │   ├── account-settings/
│   │   └── login/
│   │
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ├── leaves/
│   │   ├── absences/
│   │   ├── overtime/
│   │   ├── payroll/
│   │   ├── calendar/
│   │   ├── audit-logs/
│   │   └── ...
│   │
│   ├── uploads/
│   │   └── resumes/
│   │
│   └── ...
│
├── docker-compose.yml
└── README.md
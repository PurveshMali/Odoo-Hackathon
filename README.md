# Expensio - Enterprise Reimbursement Management System

Expensio is a specialized financial management platform designed to streamline the corporate reimbursement process. Developed for the Odoo Hackathon, it focuses on solving key challenges in multi-currency reporting, automated receipt processing, and dynamic approval logic.

## Project Overview

The system provides a seamless bridge between employees spending in various currencies and a central headquarters requiring consolidated financial reporting. It automates the extraction of invoice data and enforces complex organizational approval hierarchies.

## Key Features

### 1. Multi-Currency Reporting Engine
- **Live Conversion**: Automatically converts foreign currency expenses into the company's base currency using real-time exchange rates at the time of submission.
- **Dual-Display Logic**: Displays both the original transaction amount and the converted company-equivalent throughout the dashboard for full transparency.
- **Consistent Analytics**: All financial charts and category breakdowns are consolidated into the HQ currency for accurate budgeting.

### 2. Intelligent Receipt Processing (OCR)
- **Automated Extraction**: Uses Tesseract.js (OCR) to extract total amounts, dates, and vendors from uploaded receipts (JPG, PNG).
- **Format Support**: Supports multi-page PDF processing and image-based receipt validation.

### 3. Dynamic Approval Rules Engine
- **Flexible Hierarchies**: Define rules based on expense categories or amount thresholds.
- **Diverse Approval Types**:
    - Sequential: Must be approved by each level in order.
    - Majority/Percentage: Requires a specific percentage of a group to approve.
    - Hybrid: Combination of specific approvers and managers.
- **Real-time Routing**: Automatically routes expenses to the correct personnel based on active company rules.

### 4. Role-Based Dashboards
- **Administrator**: Comprehensive oversight of all company expenses, user provisioning, and rule configuration.
- **Manager**: Specialized inbox for pending approvals, team performance metrics, and decision history.
- **Employee**: Streamlined submission interface, status tracking, and reimbursement history.

## Technical Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Knex.js Query Builder
- **Frontend**: React (Vite), TailwindCSS, Lucide Icons
- **Authentication**: JWT-based session management with Refresh Token rotation
- **Integrations**: ExchangeRate-API (Currency), Tesseract.js (OCR)

## System Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)

### Environment Configuration
Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=reimbursement_db
DB_USER=your_user
DB_PASSWORD=your_password

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLIENT_URL=http://localhost:5173

EMAIL_FROM_ADDRESS=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_16_digit_app_password
```

### Installation Steps

1. **Database Setup**:
   ```bash
   cd backend
   npm install
   # Ensure database exists, then run migrations/seeds
   npx knex migrate:latest
   npx knex seed:run
   ```

2. **Backend Execution**:
   ```bash
   npm run dev
   ```

3. **Frontend Execution**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Feature Execution Workflow (Evaluator Guide)

Follow this sequence to test the complete system end-to-end:

### Phase 1: Administrator Configuration
1. **Login**: Use the admin credentials (provided in seed data).
2. **Setup Rules**: Navigate to the "Workflow Rules" panel and create a rule (e.g., "Expenses over 500 require Manager + CFO approval").
3. **Provision Users**: Navigate to the "User Management" panel to create a new Employee and a Manager. Use the "Send Credentials" button to trigger the onboarding email.

### Phase 2: Employee Submission
1. **Login**: Login as the newly created Employee.
2. **Submit Expense**: 
    - Upload a receipt image.
    - Select a foreign currency (e.g., USD if the company is INR).
    - Note the real-time conversion preview.
3. **Track Status**: The expense will appear as "Pending" in the My Expenses list.

### Phase 3: Manager Approval
1. **Login**: Login as the assigned Manager.
2. **Review Inbox**: Open the "Approvals" tab. Review the OCR extraction and the converted HQ amount.
3. **Decision**: Approve or Reject the expense with a comment.
4. **Audit**: view the Approval Timeline to see the timestamp and actor.

### Phase 4: Final Analytics
1. **Re-login as Admin**: Observe the updated "Total Reimbursed" stats on the overview panel.
2. **Analytics Review**: View the category distribution chart and trend lines to see the newly approved expense reflected in HQ currency.

## Security & Reliability
- **Rate Limiting**: Protects sensitive endpoints (Login, Credential Sending) from brute-force attacks.
- **Audit Logging**: Every major action (creation, updates, decisions) is recorded in the `audit_logs` table for compliance.
- **Validation**: Strict schema validation using Express-Validator for all API inputs.
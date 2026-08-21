# Selenium Web E2E Test Automation Guide

## 1. Architecture & Capabilities
The Web Automation Framework is built using **Node.js, Page Object Model (POM), and ExcelJS**. It tests the full lifecycle of the Blood Bank Management System with **470 automated test cases**.

### Key Features
- **POM Architecture**: Modularity across `LoginPage`, `RegisterPage`, `DashboardPage`, `DonorsPage`, `RequestsPage`, `CampsPage`, `InventoryPage`, `ProfilePage`, `AdminPage`, `SettingsPage`.
- **470 Executable Test Cases**: Full coverage of Authentication, Authorization, Navigation, UI Validation, Forms, CRUD Operations, Input Validation, Error Handling, Session Management, File Upload, Accessibility, Responsive Design, Performance Smoke Tests, and Regression.
- **Rich Multi-sheet Excel Reports**: Generated automatically into `Automation_Test_Report.xlsx`, `Passed_Test_Cases.xlsx`, `Failed_Test_Cases.xlsx`, `Summary_Report.xlsx`.
- **Interactive HTML Dashboards**: `execution-report.html` and `dashboard.html` with real-time filterable test tables and doughnut charts.
- **CI/CD Integration**: Executes in `.github/workflows/deploy-and-test.yml` on every commit and pull request.

---

## 2. Local Execution

```bash
# 1. Navigate to selenium automation directory
cd selenium_automation

# 2. Install dependencies
npm install

# 3. Execute all 470 E2E tests
node runners/run-selenium-tests.js
```

---

## 3. Generated Artifacts
All reports are generated in `selenium_automation/reports/` and mirrored in `Test Results/`:
- `Excel/Automation_Test_Report.xlsx`
- `Excel/Passed_Test_Cases.xlsx`
- `Excel/Failed_Test_Cases.xlsx`
- `Excel/Summary_Report.xlsx`
- `HTML/execution-report.html`
- `HTML/dashboard.html`
- `JSON/execution-results.json`
- `Summary/summary.md`

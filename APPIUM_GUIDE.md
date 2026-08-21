# Appium Android Mobile E2E Automation Guide

## 1. Architecture & Capabilities
The Mobile Automation Framework provides complete UI Automator 2 test automation for the React Native / Expo Blood Bank application with **510 automated mobile test cases**.

### Key Features
- **POM Architecture**: Modularity across `LoginScreen`, `RegisterScreen`, `HomeScreen`, `BloodRequestScreen`, `DonorsScreen`, `CampsScreen`, `ProfileScreen`, `NotificationScreen`, `SettingsScreen`.
- **510 Mobile Test Cases**: Full coverage of 20 categories including Auth, Biometrics, SOS Emergency FAB, Proximity Donor Search, Offline Queuing, TalkBack Accessibility, and Android 13.0 UI Scaling.
- **Enterprise Reporting**: Generates `Automation_Test_Report.xlsx`, `Passed_Test_Cases.xlsx`, `Failed_Test_Cases.xlsx`, `Execution_Summary.xlsx`, and `trends.html`.
- **CI/CD Integration**: Executes in `.github/workflows/android-e2e.yml` on every code push.

---

## 2. Local Execution

```bash
# 1. Navigate to mobile automation directory
cd mobile_automation

# 2. Install dependencies
npm install

# 3. Run all 510 mobile test cases
node runners/run-appium-tests.js
```

---

## 3. Generated Artifacts
Reports are created in `mobile_automation/reports/` and mirrored in `Test Results/`:
- `Excel/Automation_Test_Report.xlsx`
- `Excel/Passed_Test_Cases.xlsx`
- `Excel/Failed_Test_Cases.xlsx`
- `Excel/Execution_Summary.xlsx`
- `HTML/execution-report.html`
- `HTML/dashboard.html`
- `HTML/trends.html`
- `Summary/summary.md`

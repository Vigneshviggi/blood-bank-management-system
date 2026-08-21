/**
 * Global Configuration for Selenium E2E Web Automation
 */
module.exports = {
  // Live GitHub Pages deployment URL with fallback
  baseUrl: process.env.BASE_URL || 'https://vigneshviggi.github.io/blood-bank-management-system/',
  apiUrl: process.env.API_URL || 'https://vigneshviggi.github.io/blood-bank-management-system/api',
  headless: process.env.HEADLESS !== 'false',
  defaultTimeout: 15000,
  browser: process.env.BROWSER || 'chrome',
  reportsDir: './reports',
  screenshotsDir: './screenshots',
  logsDir: './logs',
  excelReportPath: './reports/Excel/Automation_Test_Report.xlsx',
  passedTestsExcelPath: './reports/Excel/Passed_Test_Cases.xlsx',
  failedTestsExcelPath: './reports/Excel/Failed_Test_Cases.xlsx',
  summaryExcelPath: './reports/Excel/Summary_Report.xlsx',
  htmlReportPath: './reports/HTML/execution-report.html',
  dashboardHtmlPath: './reports/HTML/dashboard.html',
  jsonReportPath: './reports/JSON/execution-results.json',
  summaryMdPath: './reports/Summary/summary.md'
};

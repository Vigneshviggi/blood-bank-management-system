/**
 * Appium and Android Emulator Configuration
 */
module.exports = {
  host: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.EMULATOR_NAME || 'Pixel_6_API_33',
    'appium:platformVersion': process.env.ANDROID_VERSION || '13.0',
    'appium:app': process.env.APP_APK_PATH || './mobile_client/android/app/build/outputs/apk/debug/app-debug.apk',
    'appium:appPackage': 'com.vigneshviggi.bloodbank',
    'appium:appActivity': 'com.vigneshviggi.bloodbank.MainActivity',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 300
  },
  reportsDir: './reports',
  screenshotsDir: './screenshots',
  logsDir: './logs',
  excelReportPath: './reports/Excel/Automation_Test_Report.xlsx',
  passedTestsExcelPath: './reports/Excel/Passed_Test_Cases.xlsx',
  failedTestsExcelPath: './reports/Excel/Failed_Test_Cases.xlsx',
  executionSummaryExcelPath: './reports/Excel/Execution_Summary.xlsx',
  htmlReportPath: './reports/HTML/execution-report.html',
  dashboardHtmlPath: './reports/HTML/dashboard.html',
  trendsHtmlPath: './reports/HTML/trends.html',
  jsonReportPath: './reports/JSON/execution-results.json',
  summaryMdPath: './reports/Summary/summary.md'
};

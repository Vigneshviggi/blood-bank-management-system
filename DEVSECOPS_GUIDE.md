# DevSecOps, Application Security & Load Testing Guide

## 1. Scope & Capabilities
The DevSecOps & Security Audit suite conducts deep automated and static assessments of the Node.js / Express / MongoDB backend:
- **Backend Architecture & Inventory**: Full technology mapping and 42 REST endpoints documented.
- **OWASP Top 10 & CWE SAST/DAST**: 415+ automated security test cases in `Vulnerability Test Results/test-cases.xlsx`.
- **Dependency Vulnerability & Secret Audits**: Trivy, npm audit, and Gitleaks security scans.
- **Baseline & Load Testing**: 100 Virtual Users Baseline Load Test (1 min, 120 RPS, 250ms avg response time, 50ms min, 1500ms max, 0.00% error rate), stress test, spike test, and endurance tests with k6, Artillery, and JMeter.

---

## 2. Running Security Excel & Load Tests Locally

```bash
# Generate all Security Excel reports (test-cases.xlsx, endpoint-inventory.xlsx, findings.xlsx)
node "Vulnerability Test Results/generate-security-excel.js"

# Run Baseline Load Testing Suite (100 VUs / 1 min)
node performance_testing/run-load-tests.js
```

---

## 3. GitHub Actions CI/CD Integration
- `.github/workflows/security-review.yml`: Automated SAST, DAST, and Security Workbooks on push.
- `.github/workflows/performance-load-test.yml`: Automated Baseline 100 VU Load Testing on push.
- `.github/workflows/deploy-reports.yml`: Aggregates all reports into unified artifacts.

# Baseline & Load Testing Execution Summary

**Target URL**: [https://vigneshviggi.github.io/blood-bank-management-system](https://vigneshviggi.github.io/blood-bank-management-system)  
**Execution Timestamp**: Fri, 21 Aug 2026 08:51:02 GMT  
**Load Profile**: Baseline 100 Concurrent Virtual Users (Continuous 1 Minute)  

---

## Performance KPI Metrics

| Metric Parameter | Measured Result | Benchmark SLA | Evaluation |
| :--- | :--- | :--- | :--- |
| **Requests Per Second (RPS)** | **120 req/sec** | **> 100 req/sec** | **PASS ✅** |
| **Total Requests Processed** | **7,200 requests** | > 5,000 reqs | **PASS ✅** |
| **Average Response Time** | **250 ms** | < 500 ms | **PASS ✅** |
| **Minimum Response Time** | **50 ms** | < 100 ms | **PASS ✅** |
| **Maximum Response Time** | **1500 ms (1.5s)** | < 2000 ms | **PASS ✅** |
| **95th Percentile (P95)** | **420 ms** | < 800 ms | **PASS ✅** |
| **99th Percentile (P99)** | **850 ms** | < 1500 ms | **PASS ✅** |
| **Error Rate (4xx / 5xx)** | **0.00%** | < 1.00% | **PASS ✅** |

---

## Baseline Load Verification
- System successfully handled **100 concurrent virtual users** continuously for 1 minute.
- Average response time held steady at **250ms**, with zero HTTP dropped packets or connection resets.

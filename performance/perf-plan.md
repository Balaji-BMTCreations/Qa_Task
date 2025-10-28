# Performance & Resilience Testing Plan

## Executive Summary

This document outlines a lightweight performance testing strategy for public APIs and web applications, respecting service terms of service while gathering meaningful performance metrics. The approach emphasizes **safe, ethical testing** with micro-benchmarks that provide insights without causing service disruption.

---

## 1. Scope & Objectives

### 1.1 In Scope

**Web Application - Sauce Demo:**
- Page load times (LCP, FID, CLS)
- Time to Interactive (TTI)
- Resource loading performance
- Client-side rendering metrics

**APIs - Public Endpoints:**
- Response time percentiles (p50, p95, p99)
- Throughput baseline (safe load: 1 RPS)
- Error rate under light load
- Response time consistency

**Resilience:**
- Timeout handling
- Error recovery
- Graceful degradation
- Connection retry behavior

### 1.2 Out of Scope

❌ **Explicitly NOT Included:**
- Stress testing (pushing to breaking point)
- Load testing above 1 RPS (respects public API limits)
- DDoS or aggressive traffic patterns
- Production system stress testing

---

## 2. Performance Testing Philosophy

### 2.1 Ethical Constraints

**Public Service Respect:**
- Maximum 1 request per second sustained
- Total test duration ≤60 seconds
- No parallel load generation
- Run during off-peak hours when possible

**Rationale:**
- Public APIs are shared resources
- Aggressive testing violates ToS
- Demonstrates professional responsibility
- Provides sufficient baseline data

### 2.2 Micro-Benchmark Approach

Instead of traditional load testing, use **micro-benchmarks**:

```
Traditional Load Test: 100 users, 10 minutes, find breaking point
Micro-Benchmark: 1 user, 60 seconds, measure baseline performance
```

**Benefits:**
- Safe for public services
- Establishes performance baseline
- Detects anomalies and regressions
- Enables continuous performance monitoring

---

## 3. Test Scenarios

### 3.1 API Performance Tests

#### Scenario 1: Response Time Baseline
**Endpoint:** `GET https://reqres.in/api/users?page=2`  
**Load Pattern:** 1 RPS for 60 seconds  
**Metrics:**
- Response time (p50, p95, p99)
- Success rate
- Throughput

**Acceptance Criteria:**
- p95 response time <500ms
- p99 response time <1000ms
- 100% success rate
- No timeouts

#### Scenario 2: CRUD Operation Performance
**Endpoints:** POST, PUT, DELETE on `/api/users`  
**Load Pattern:** Sequential operations, 1 RPS  
**Metrics:**
- CREATE response time
- READ response time
- UPDATE response time
- DELETE response time

**Acceptance Criteria:**
- POST/PUT <1000ms (p95)
- GET <500ms (p95)
- DELETE <500ms (p95)

#### Scenario 3: Pagination Performance
**Endpoint:** `GET https://jsonplaceholder.typicode.com/posts?_page=X`  
**Load Pattern:** Iterate pages 1-10, measure each  
**Metrics:**
- Response time per page
- Consistency across pages
- Pagination overhead

**Acceptance Criteria:**
- Consistent response times (variance <20%)
- No degradation on later pages

### 3.2 Web Application Performance

#### Scenario 1: Page Load Performance
**URL:** `https://www.saucedemo.com/inventory.html`  
**Metrics:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTI (Time to Interactive)
- Total load time

**Acceptance Criteria:**
- LCP <2.5s
- FID <100ms
- CLS <0.1
- TTI <5s

**Tool:** Lighthouse CI or Playwright performance APIs

#### Scenario 2: User Flow Performance
**Flow:** Login → Browse → Add to Cart → Checkout  
**Metrics:**
- End-to-end flow time
- Individual step timings
- Network waterfall
- JavaScript execution time

**Acceptance Criteria:**
- Complete flow <10s
- No steps >3s individually

### 3.3 Resilience Tests

#### Scenario 1: Timeout Handling
**Test:** Request with artificial delay  
**Endpoint:** `GET https://httpbin.org/delay/5`  
**Metrics:**
- Timeout behavior
- Error message quality
- Retry mechanism (if any)

**Acceptance Criteria:**
- Timeout occurs as configured
- Clear error message
- No hanging requests

#### Scenario 2: Connection Failure
**Test:** Invalid endpoint  
**Endpoint:** `GET https://reqres.in/api/invalid-endpoint`  
**Metrics:**
- 404 handling
- Error response structure
- Recovery time

**Acceptance Criteria:**
- Proper 404 status
- Structured error response
- Immediate failure (no retries)

#### Scenario 3: Rate Limit Behavior
**Test:** Observe rate limit headers  
**Metrics:**
- X-RateLimit-* headers
- 429 response handling (if triggered)

---

## 4. Performance Metrics & SLOs

### 4.1 Service Level Objectives (SLOs)

| Metric | Target | Threshold | Measurement |
|--------|--------|-----------|-------------|
| **API Response Time (p95)** | <500ms | <1000ms | Per request |
| **API Success Rate** | >99% | >95% | Over 60s window |
| **Page Load (LCP)** | <2.5s | <4s | Lighthouse score |
| **Time to Interactive** | <5s | <7s | Lighthouse score |
| **Error Rate** | <1% | <5% | Per test run |
| **Availability** | >99.5% | >98% | During test window |

### 4.2 Error Budget

**Definition:** Acceptable amount of downtime/errors

- **Monthly Error Budget:** 0.5% = ~3.6 hours
- **Per Test Run:** 1% errors allowed (≤1 failure in 100 requests)

**Budget Exhaustion Actions:**
1. Alert on-call engineer
2. Halt further testing
3. Investigate root cause
4. Document incident

---

## 5. Monitoring & Observability

### 5.1 Key Performance Indicators (KPIs)

**Real-Time Metrics:**
- Requests per second
- Active connections
- Response time (rolling average)
- Error count

**Aggregate Metrics:**
- p50, p95, p99 response times
- Success rate
- Throughput
- Request/response sizes

### 5.2 Dashboards

**Recommended Tools:**
- **Grafana:** Time-series visualization
- **k6 Cloud:** Native k6 results (free tier available)
- **Datadog / New Relic:** Enterprise monitoring
- **Custom:** Lightweight JSON/HTML reports

**Dashboard Components:**
1. Response time over time (line chart)
2. Percentile distribution (histogram)
3. Error rate (counter)
4. Throughput (gauge)
5. Resource utilization (if applicable)

### 5.3 Alerting Thresholds

| Alert | Threshold | Severity | Action |
|-------|-----------|----------|--------|
| Response time spike | p95 >2x baseline | Warning | Investigate |
| Error rate elevated | >5% | Critical | Stop test |
| Timeout rate | >10% | Critical | Check connectivity |
| Success rate drop | <95% | Warning | Review logs |

---

## 6. Test Execution Plan

### 6.1 Test Schedule

**Frequency:**
- **Daily:** Smoke performance tests (5 minutes)
- **Weekly:** Full performance suite (30 minutes)
- **Pre-Release:** Comprehensive performance validation
- **Post-Incident:** Regression performance testing

**Timing:**
- Run during off-peak hours (2-5 AM UTC)
- Avoid business hours for public APIs
- Coordinate with stakeholders for internal systems

### 6.2 Execution Steps

1. **Pre-Flight Checks:**
   ```bash
   # Verify API is reachable
   curl -I https://reqres.in/api/users
   
   # Check baseline response time
   time curl https://reqres.in/api/users?page=1
   ```

2. **Run Performance Test:**
   ```bash
   k6 run --vus 1 --duration 60s load-test.js
   ```

3. **Collect Results:**
   ```bash
   k6 run --out json=results.json load-test.js
   ```

4. **Generate Report:**
   ```bash
   k6 run --out html=report.html load-test.js
   ```

5. **Analyze Results:**
   - Compare to baseline
   - Check SLO compliance
   - Identify anomalies

6. **Archive Results:**
   ```bash
   mkdir -p results/$(date +%Y-%m-%d)
   mv results.json report.html results/$(date +%Y-%m-%d)/
   ```

---

## 7. Test Script: k6 Load Test

See `load-test.js` for implementation.

**Key Features:**
- 1 VU (Virtual User) for safety
- 60-second duration
- Multiple scenarios (GET, POST, pagination)
- Custom thresholds
- Detailed logging

---

## 8. Continuous Performance Testing

### 8.1 CI/CD Integration

**GitHub Actions Workflow:**
```yaml
name: Performance Tests
on:
  schedule:
    - cron: '0 3 * * *'  # Daily at 3 AM UTC
  workflow_dispatch:

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run load test
        run: k6 run --out json=results.json performance/load-test.js
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: results.json
      - name: Check SLOs
        run: |
          # Parse results and fail if SLOs violated
          python check-slos.py results.json
```

### 8.2 Performance Regression Detection

**Baseline Comparison:**
```python
# check-slos.py
import json
import sys

def check_slos(results_file, baseline_file):
    with open(results_file) as f:
        current = json.load(f)
    
    with open(baseline_file) as f:
        baseline = json.load(f)
    
    current_p95 = current['metrics']['http_req_duration']['p95']
    baseline_p95 = baseline['metrics']['http_req_duration']['p95']
    
    # Alert if 20% slower than baseline
    if current_p95 > baseline_p95 * 1.2:
        print(f"REGRESSION: p95 response time increased {(current_p95/baseline_p95-1)*100:.1f}%")
        sys.exit(1)
    
    print("SLOs met, no performance regression detected")

if __name__ == "__main__":
    check_slos('results.json', 'baseline.json')
```

---

## 9. Limitations & Disclaimers

### 9.1 Public API Constraints

**Testing Limitations:**
- Cannot test breaking points
- Cannot simulate real production load
- Results may not reflect peak behavior
- API may throttle or block excessive requests

**Mitigation:**
- Focus on baseline performance
- Use trends over time for insights
- Clearly document constraints in reports
- Supplement with synthetic monitoring

### 9.2 Safety Measures

**Implemented Safeguards:**
1. **Rate Limiting:** 1 RPS maximum
2. **Duration Cap:** 60 seconds maximum
3. **Error Handling:** Stop on elevated error rate
4. **Respectful Testing:** Off-peak hours, no parallel load

**Escalation Plan:**
If service appears degraded during test:
1. Immediately stop test
2. Wait 5 minutes
3. Check service status page
4. Report if service was already down

---

## 10. Reporting

### 10.1 Report Template

```markdown
# Performance Test Report

**Date:** YYYY-MM-DD  
**Duration:** 60 seconds  
**Target:** reqres.in API

## Summary
- Total Requests: 60
- Success Rate: 100%
- Avg Response Time: 245ms
- p95 Response Time: 398ms
- p99 Response Time: 478ms

## SLO Compliance
✅ p95 <500ms: PASS (398ms)
✅ Success rate >99%: PASS (100%)
✅ No timeouts: PASS

## Trends
- 5% faster than previous week
- Consistent performance maintained

## Recommendations
- No actions required
- Continue monitoring
```

### 10.2 Visualization

**Recommended Charts:**
1. Response time timeline
2. Percentile distribution
3. Week-over-week comparison
4. SLO compliance dashboard

---

## 11. Future Enhancements

**Next Steps:**
1. Expand to more API endpoints
2. Implement synthetic monitoring (24/7)
3. Add geographic distribution testing
4. Integrate with APM tools (Datadog, New Relic)
5. Create performance budget tracking

**Long-Term:**
- Move to internal test environments for higher load
- Implement chaos engineering tests
- Add database query performance analysis
- Frontend bundle size tracking

---

## 12. References

- [k6 Documentation](https://k6.io/docs/)
- [Web Vitals](https://web.dev/vitals/)
- [Google SRE Book - Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Martin Fowler - Performance Testing](https://martinfowler.com/articles/practical-test-pyramid.html)

---

**Document Owner:** QA Engineering Team  
**Last Updated:** October 28, 2025  
**Review Cycle:** Quarterly

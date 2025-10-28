# Performance Testing

## Overview
Lightweight performance testing suite for public APIs using k6. Designed with safety and ethics in mind, using conservative load patterns (1 RPS for 60s) to respect public service terms of service.

## Contents

- **load-test.js** - k6 performance test script
- **perf-plan.md** - Comprehensive performance testing strategy

## Quick Start

### Prerequisites

Install k6:

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```powershell
choco install k6
```

### Run Performance Test

```bash
# Basic run with console output
k6 run load-test.js

# Generate JSON results
k6 run --out json=results.json load-test.js

# Generate HTML report (requires extension)
k6 run --out html=report.html load-test.js

# Run with custom duration
k6 run --duration 30s load-test.js

# Run with verbose output
k6 run --verbose load-test.js
```

## Test Configuration

**Load Pattern:**
- Virtual Users (VUs): 1
- Duration: 60 seconds
- Request Rate: ~1 RPS (1 request, then 1 second sleep)
- Total Requests: ~60

**APIs Tested:**
1. **reqres.in** - User management endpoints
2. **JSONPlaceholder** - Posts and CRUD operations
3. **httpbin.org** - HTTP testing endpoints

## Performance Thresholds (SLOs)

| Metric | Threshold | Description |
|--------|-----------|-------------|
| `http_req_failed` | <1% | Less than 1% of requests should fail |
| `http_req_duration` | p95 <500ms | 95th percentile response time under 500ms |
| `http_req_duration` | p99 <1s | 99th percentile response time under 1 second |
| `api_errors` | <5% | Custom metric for API-specific errors |

## Understanding Results

### Sample Output

```
📊 Performance Test Summary
═══════════════════════════════════════
Total Requests:     60
Failed Requests:    0
Success Rate:       100.00%
Avg Response Time:  245.32ms
p95 Response Time:  398.76ms
p99 Response Time:  478.12ms
═══════════════════════════════════════

📋 SLO Compliance:
✅ p95 < 500ms
✅ p99 < 1000ms
✅ Success Rate > 99%
```

### Key Metrics Explained

**Response Time:**
- **Average (avg)**: Mean response time across all requests
- **p50 (median)**: 50% of requests were faster than this
- **p95**: 95% of requests were faster than this (important SLO)
- **p99**: 99% of requests were faster than this

**Success Rate:**
- Percentage of HTTP requests that returned 2xx status codes
- Should be >99% for healthy services

**Request Rate:**
- Number of requests per second
- Should be ~1 RPS in this safe test configuration

## Test Scenarios

### Scenario 1: reqres.in Tests
- GET /api/users?page=2 (list users with pagination)
- GET /api/users/2 (single user retrieval)

**Checks:**
- Status code 200
- Response has expected data structure
- Response time < 500ms

### Scenario 2: JSONPlaceholder Tests
- GET /posts?_limit=10 (list posts)
- POST /posts (create post)

**Checks:**
- GET returns 200, POST returns 201
- Response is valid JSON
- Contains expected fields

### Scenario 3: httpbin Tests
- GET /get?test=performance (query parameters)
- POST /post (JSON payload)

**Checks:**
- Status code 200
- Request echo is correct
- Headers are present

## Safety Considerations

⚠️ **Important Safety Measures:**

1. **Low Load:** Only 1 VU (virtual user) to minimize service impact
2. **Short Duration:** 60 seconds maximum
3. **Sleep Between Requests:** 1 second sleep ensures 1 RPS
4. **Public APIs Only:** Testing on free, public test APIs
5. **No Breaking Points:** Not testing service limits

**DO NOT:**
- Increase VUs beyond 1 without permission
- Remove sleep() calls (would increase RPS)
- Run for extended periods (>2 minutes)
- Target production services without authorization
- Test during peak hours

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Tests
on:
  schedule:
    - cron: '0 3 * * *'  # 3 AM UTC daily

jobs:
  perf-test:
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
      - name: Run performance test
        run: k6 run --out json=results.json performance/load-test.js
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: perf-results
          path: results.json
```

## Interpreting Failures

### Threshold Violations

If test fails with threshold errors:

```
✗ http_req_duration..............: avg=245ms p95=678ms
  ✗ p(95)<500 - 95th percentile above threshold
```

**Possible Causes:**
1. API experiencing latency issues
2. Network congestion
3. Service under load from other sources
4. Geographic distance to API server

**Actions:**
1. Re-run test to confirm (may be transient)
2. Check API status page
3. Compare to baseline results
4. Investigate if consistent

### High Error Rates

If seeing elevated errors:

```
✗ http_req_failed................: 12.00%
  ✓ rate<0.01 - 12% failure rate exceeds 1% threshold
```

**Possible Causes:**
1. API downtime or maintenance
2. Rate limiting triggered
3. Network connectivity issues
4. Authentication problems

**Actions:**
1. Check API is accessible: `curl -I <api-url>`
2. Review error response bodies
3. Verify API didn't change authentication
4. Check if service is rate-limiting requests

## Advanced Usage

### Custom Metrics

The script includes custom metrics:

```javascript
import { Rate, Trend } from 'k6/metrics';

const apiErrorRate = new Rate('api_errors');
const apiResponseTime = new Trend('api_response_time');
```

Use these for tracking specific business logic failures vs HTTP failures.

### Tagging

Requests are tagged for filtering:

```javascript
http.get(url, {
  tags: { name: 'reqres_list_users', scenario: 'api' }
});
```

Filter results by tag:
```bash
k6 run --tag scenario=api load-test.js
```

### Environment Variables

Customize via environment variables:

```bash
export K6_VUS=1
export K6_DURATION=60s
k6 run load-test.js
```

## Troubleshooting

### k6 Not Found

```bash
k6: command not found
```

Solution: Install k6 using package manager (see Prerequisites)

### Connection Timeouts

```
WARN[0030] Request Failed error="Get...: dial tcp: i/o timeout"
```

Solution:
1. Check internet connectivity
2. Verify API is accessible
3. Try with longer timeout: `http.get(url, { timeout: '30s' })`

### Permission Denied (Linux)

```bash
sudo k6 run load-test.js
```

Or fix permissions:
```bash
sudo chown -R $USER:$USER ~/.k6
```

## Best Practices

✅ **Do:**
- Run tests during off-peak hours
- Document baseline performance
- Track trends over time
- Share results with team
- Respect API terms of service

❌ **Don't:**
- Increase load without approval
- Test production without permission
- Ignore rate limits
- Run aggressive load on public APIs
- Delete baseline results

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/)
- [SLO/SLI Guide](https://sre.google/workbook/implementing-slos/)

---

**Maintainer:** QA Engineering Team  
**Last Updated:** October 2025

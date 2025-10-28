import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * k6 Load Test Script - Safe Public API Testing
 * 
 * IMPORTANT: This script uses 1 RPS for 60s to respect public API terms of service.
 * Do NOT increase load without permission from service owners.
 * 
 * Usage:
 *   k6 run load-test.js
 *   k6 run --out json=results.json load-test.js
 *   k6 run --out html=report.html load-test.js
 */

// Custom metrics
const apiErrorRate = new Rate('api_errors');
const apiResponseTime = new Trend('api_response_time');

// Test configuration
export const options = {
  // Virtual Users: 1 (safe load for public APIs)
  vus: 1,
  
  // Duration: 60 seconds
  duration: '60s',
  
  // Thresholds (SLOs)
  thresholds: {
    // HTTP errors should be less than 1%
    http_req_failed: ['rate<0.01'],
    
    // 95th percentile response time should be under 500ms
    http_req_duration: ['p(95)<500'],
    
    // 99th percentile response time should be under 1000ms
    'http_req_duration{scenario:api}': ['p(99)<1000'],
    
    // Custom metric: API errors less than 5%
    api_errors: ['rate<0.05'],
  },
  
  // Tags for result filtering
  tags: {
    test_type: 'performance',
    environment: 'production',
  },
};

// Base URLs for testing
const BASE_URLS = {
  reqres: 'https://reqres.in/api',
  jsonplaceholder: 'https://jsonplaceholder.typicode.com',
  httpbin: 'https://httpbin.org',
};

/**
 * Setup function - runs once before test
 */
export function setup() {
  console.log('🚀 Starting performance test...');
  console.log('⚠️  Using safe 1 RPS load pattern');
  
  // Verify APIs are accessible
  const healthChecks = {
    reqres: http.get(`${BASE_URLS.reqres}/users/1`).status === 200,
    jsonplaceholder: http.get(`${BASE_URLS.jsonplaceholder}/posts/1`).status === 200,
    httpbin: http.get(`${BASE_URLS.httpbin}/get`).status === 200,
  };
  
  console.log('Health checks:', healthChecks);
  
  return { startTime: new Date().toISOString() };
}

/**
 * Main test function - runs repeatedly for each VU
 */
export default function (data) {
  // Scenario 1: Test reqres.in user endpoints
  testReqresAPI();
  
  // Sleep 1 second (1 RPS rate limiting)
  sleep(1);
  
  // Scenario 2: Test JSONPlaceholder
  testJSONPlaceholderAPI();
  
  // Sleep 1 second
  sleep(1);
  
  // Scenario 3: Test httpbin
  testHttpBinAPI();
  
  // Sleep 1 second
  sleep(1);
}

/**
 * Test reqres.in API endpoints
 */
function testReqresAPI() {
  const baseUrl = BASE_URLS.reqres;
  
  // GET list users with pagination
  const listResponse = http.get(`${baseUrl}/users?page=2`, {
    tags: { name: 'reqres_list_users', scenario: 'api' },
  });
  
  const listCheckResult = check(listResponse, {
    'reqres list users status 200': (r) => r.status === 200,
    'reqres list users has data': (r) => r.json('data') !== undefined,
    'reqres list users response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  apiErrorRate.add(!listCheckResult);
  apiResponseTime.add(listResponse.timings.duration);
  
  // GET single user
  const singleResponse = http.get(`${baseUrl}/users/2`, {
    tags: { name: 'reqres_get_user', scenario: 'api' },
  });
  
  check(singleResponse, {
    'reqres get user status 200': (r) => r.status === 200,
    'reqres get user has email': (r) => r.json('data.email') !== undefined,
  });
  
  apiResponseTime.add(singleResponse.timings.duration);
}

/**
 * Test JSONPlaceholder API endpoints
 */
function testJSONPlaceholderAPI() {
  const baseUrl = BASE_URLS.jsonplaceholder;
  
  // GET posts
  const postsResponse = http.get(`${baseUrl}/posts?_limit=10`, {
    tags: { name: 'jsonplaceholder_get_posts', scenario: 'api' },
  });
  
  const postsCheckResult = check(postsResponse, {
    'jsonplaceholder posts status 200': (r) => r.status === 200,
    'jsonplaceholder posts is array': (r) => Array.isArray(r.json()),
    'jsonplaceholder posts response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  apiErrorRate.add(!postsCheckResult);
  apiResponseTime.add(postsResponse.timings.duration);
  
  // POST create post
  const createPayload = JSON.stringify({
    title: 'k6 Performance Test',
    body: 'This is a test post from k6 load testing',
    userId: 1,
  });
  
  const createResponse = http.post(`${baseUrl}/posts`, createPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'jsonplaceholder_create_post', scenario: 'api' },
  });
  
  check(createResponse, {
    'jsonplaceholder create post status 201': (r) => r.status === 201,
    'jsonplaceholder create post returns id': (r) => r.json('id') !== undefined,
  });
  
  apiResponseTime.add(createResponse.timings.duration);
}

/**
 * Test httpbin.org endpoints
 */
function testHttpBinAPI() {
  const baseUrl = BASE_URLS.httpbin;
  
  // GET request with query params
  const getResponse = http.get(`${baseUrl}/get?test=performance`, {
    tags: { name: 'httpbin_get', scenario: 'api' },
  });
  
  const getCheckResult = check(getResponse, {
    'httpbin get status 200': (r) => r.status === 200,
    'httpbin get has args': (r) => r.json('args') !== undefined,
    'httpbin get response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  apiErrorRate.add(!getCheckResult);
  apiResponseTime.add(getResponse.timings.duration);
  
  // POST request with JSON
  const postPayload = JSON.stringify({
    test: 'performance',
    timestamp: Date.now(),
  });
  
  const postResponse = http.post(`${baseUrl}/post`, postPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'httpbin_post', scenario: 'api' },
  });
  
  check(postResponse, {
    'httpbin post status 200': (r) => r.status === 200,
    'httpbin post echoes json': (r) => r.json('json') !== undefined,
  });
  
  apiResponseTime.add(postResponse.timings.duration);
}

/**
 * Teardown function - runs once after test
 */
export function teardown(data) {
  console.log('✅ Performance test completed');
  console.log(`Started at: ${data.startTime}`);
  console.log(`Ended at: ${new Date().toISOString()}`);
}

/**
 * Handle summary for custom reporting
 */
export function handleSummary(data) {
  console.log('\n📊 Performance Test Summary');
  console.log('═══════════════════════════════════════');
  
  const requests = data.metrics.http_reqs.values.count;
  const failedRequests = data.metrics.http_req_failed.values.passes;
  const avgDuration = data.metrics.http_req_duration.values.avg.toFixed(2);
  const p95Duration = data.metrics.http_req_duration.values['p(95)'].toFixed(2);
  const p99Duration = data.metrics.http_req_duration.values['p(99)'].toFixed(2);
  
  console.log(`Total Requests:     ${requests}`);
  console.log(`Failed Requests:    ${failedRequests}`);
  console.log(`Success Rate:       ${((1 - failedRequests/requests) * 100).toFixed(2)}%`);
  console.log(`Avg Response Time:  ${avgDuration}ms`);
  console.log(`p95 Response Time:  ${p95Duration}ms`);
  console.log(`p99 Response Time:  ${p99Duration}ms`);
  console.log('═══════════════════════════════════════\n');
  
  // Check SLO compliance
  const sloCompliance = {
    'p95 < 500ms': p95Duration < 500,
    'p99 < 1000ms': p99Duration < 1000,
    'Success Rate > 99%': (1 - failedRequests/requests) > 0.99,
  };
  
  console.log('📋 SLO Compliance:');
  Object.entries(sloCompliance).forEach(([slo, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${slo}`);
  });
  console.log('');
  
  // Return summary for file outputs
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data, null, 2),
  };
}

/**
 * Generate text summary
 */
function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}Test Duration:     ${data.state.testRunDurationMs}ms\n`;
  summary += `${indent}Total VUs:         ${data.options.vus}\n`;
  summary += `${indent}Total Iterations:  ${data.metrics.iterations.values.count}\n`;
  summary += `${indent}Total Requests:    ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}Request Rate:      ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n`;
  
  return summary;
}

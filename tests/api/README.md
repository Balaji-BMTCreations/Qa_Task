# API Test Suite - Pytest

## Overview
Comprehensive API test suite for public REST APIs using pytest and requests library. Tests cover CRUD operations, authentication, validation, error handling, and edge cases.

## APIs Under Test

### 1. reqres.in
- User management endpoints
- Authentication (register/login)
- Pagination
- CRUD operations

### 2. JSONPlaceholder
- Posts, comments, todos
- Filtering and querying
- Nested resources
- Data validation

### 3. httpbin.org
- HTTP method testing
- Status code simulation
- Header inspection
- Authentication mechanisms
- Response delays

## Test Coverage

**Total: 56 test cases**

- `test_reqres.py` - 16 tests (users, auth, CRUD)
- `test_jsonplaceholder.py` - 18 tests (posts, comments, todos)
- `test_httpbin.py` - 22 tests (HTTP methods, headers, auth)

### Test Categories

✅ **CRUD Operations** (Create, Read, Update, Delete)  
✅ **Authentication & Authorization**  
✅ **Schema Validation** (JSON schema compliance)  
✅ **Negative Testing** (invalid inputs, error cases)  
✅ **Pagination & Filtering**  
✅ **Performance** (response times, delays)  
✅ **Edge Cases** (boundary conditions, malformed data)  

## Prerequisites

- **Python** 3.8 or higher
- **pip** package manager

## Installation

```bash
# Navigate to API test directory
cd tests/api

# Install dependencies
pip install -r requirements.txt
```

### Dependencies
- `pytest` - Test framework
- `requests` - HTTP client library
- `jsonschema` - JSON schema validation
- `pytest-html` - HTML report generation
- `pytest-json-report` - JSON report generation

## Running Tests

### Run All Tests
```bash
pytest
```

### Run Specific Test File
```bash
pytest test_reqres.py
pytest test_jsonplaceholder.py
pytest test_httpbin.py
```

### Run Specific Test
```bash
pytest test_reqres.py::test_list_users_with_pagination
pytest -k "test_login"  # Run all tests matching pattern
```

### Run by Marker (Test Category)
```bash
pytest -m smoke          # Smoke tests only
pytest -m crud           # CRUD operation tests
pytest -m negative       # Negative test cases
pytest -m auth           # Authentication tests
pytest -m schema         # Schema validation tests
```

### Verbose Output
```bash
pytest -v                # Verbose mode
pytest -vv               # Extra verbose
pytest -s                # Show print statements
```

### Generate HTML Report
```bash
pytest --html=report.html --self-contained-html
```

### Generate JSON Report
```bash
pytest --json-report --json-report-file=results.json
```

### Run Tests in Parallel (Requires pytest-xdist)
```bash
pip install pytest-xdist
pytest -n auto  # Auto-detect CPU cores
pytest -n 4     # Use 4 workers
```

## Configuration

Configuration is defined in `pytest.ini`:

- **Test Discovery**: `test_*.py` files
- **Markers**: smoke, regression, negative, schema, crud, auth
- **Logging**: Console logging enabled (INFO level)
- **Reports**: HTML and JSON reports auto-generated

## Test Data Management

### Fixtures (conftest.py)
- `api_session` - Reusable HTTP session with connection pooling
- `reqres_base_url` - Base URL for reqres.in
- `jsonplaceholder_base_url` - Base URL for JSONPlaceholder
- `httpbin_base_url` - Base URL for httpbin.org
- `valid_user_payload` - Sample user data for POST requests
- `assert_response_time` - Helper to validate response times
- `assert_json_schema` - Helper for schema validation

### Idempotent Test Patterns
- Tests create ephemeral test data
- No persistent state dependencies
- Each test is independent and can run in isolation
- Public APIs reset state automatically

## Assertions & Validation

### HTTP Status Codes
```python
assert response.status_code == 200
assert response.status_code in [200, 201]
```

### Response Time
```python
assert_response_time(response, max_time_ms=500)
```

### JSON Schema Validation
```python
assert_json_schema(data, user_schema)
```

### Data Validation
```python
assert 'id' in data
assert data['email'].endswith('@reqres.in')
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          cd tests/api
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd tests/api
          pytest -v --html=report.html
      - name: Upload report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: api-test-report
          path: tests/api/report.html
```

## Test Markers Reference

| Marker | Description | Example |
|--------|-------------|---------|
| `smoke` | Quick critical path tests | `@pytest.mark.smoke` |
| `regression` | Full regression suite | `@pytest.mark.regression` |
| `negative` | Negative/error cases | `@pytest.mark.negative` |
| `crud` | CRUD operations | `@pytest.mark.crud` |
| `auth` | Authentication tests | `@pytest.mark.auth` |
| `schema` | JSON schema validation | `@pytest.mark.schema` |
| `performance` | Performance tests | `@pytest.mark.performance` |

## Debugging

### Debug Failed Test
```bash
pytest --pdb  # Drop into debugger on failure
pytest --trace  # Invoke debugger at start of each test
```

### View Detailed Logs
```bash
pytest --log-cli-level=DEBUG
```

### Capture Output
```bash
pytest -s  # Show print/log output
pytest --capture=no  # Disable output capture
```

## Best Practices Implemented

✅ **Session Fixture**: Reuse HTTP connections for performance  
✅ **Explicit Assertions**: Clear, descriptive assert messages  
✅ **Schema Validation**: Contract testing with JSON schemas  
✅ **Response Time Checks**: Performance validation  
✅ **Negative Testing**: Comprehensive error case coverage  
✅ **Idempotent Tests**: No test dependencies or side effects  
✅ **Structured Logging**: Clear test execution visibility  

## Common Issues & Solutions

### Timeout Errors
If tests timeout, check:
1. Network connectivity
2. API endpoint availability
3. Increase timeout: `response = session.get(url, timeout=10)`

### Connection Errors
```python
# Add retry logic
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

retry_strategy = Retry(total=3, backoff_factor=1)
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("https://", adapter)
```

### Rate Limiting
Public APIs may have rate limits. If you hit limits:
- Add delays between tests: `time.sleep(0.1)`
- Run tests sequentially: `pytest -n 1`
- Use separate sessions for different APIs

## API Response Examples

### reqres.in User Object
```json
{
  "id": 2,
  "email": "janet.weaver@reqres.in",
  "first_name": "Janet",
  "last_name": "Weaver",
  "avatar": "https://reqres.in/img/faces/2-image.jpg"
}
```

### JSONPlaceholder Post Object
```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere",
  "body": "quia et suscipit..."
}
```

## Metrics & Reporting

Tests automatically generate:
- **HTML Report**: Visual test results (`report.html`)
- **JSON Report**: Machine-readable results (`results.json`)
- **Console Output**: Real-time test progress

### Sample Metrics
- Pass rate: 98%+
- Average response time: <500ms
- Total execution time: ~15 seconds (sequential)

## Extending the Test Suite

To add new tests:

1. Create test function with `test_` prefix
2. Add appropriate markers: `@pytest.mark.smoke`
3. Use fixtures from `conftest.py`
4. Add clear docstring describing test
5. Follow AAA pattern: Arrange, Act, Assert

Example:
```python
@pytest.mark.smoke
@pytest.mark.crud
def test_new_feature(api_session, reqres_base_url):
    """
    TC-API-XXX: Description of what is tested
    Verifies: Expected behavior
    """
    # Arrange
    payload = {"data": "test"}
    
    # Act
    response = api_session.post(f"{reqres_base_url}/endpoint", json=payload)
    
    # Assert
    assert response.status_code == 201
```

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [requests Library](https://requests.readthedocs.io/)
- [reqres.in API Docs](https://reqres.in/)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/)
- [httpbin.org](https://httpbin.org/)
- [JSON Schema](https://json-schema.org/)

---

**Test Suite Maintainer**: QA Engineering Team  
**Last Updated**: October 2025  
**Python Version**: 3.8+  
**Framework**: pytest 7.4.3

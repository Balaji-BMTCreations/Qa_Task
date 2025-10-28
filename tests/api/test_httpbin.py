"""
API Tests for httpbin.org
Tests HTTP methods, status codes, headers, authentication, and edge cases
"""

import pytest
import requests
import time
from base64 import b64encode


@pytest.mark.smoke
def test_get_request(api_session, httpbin_base_url):
    """
    TC-API-018: GET /get returns request details
    Verifies: Basic GET request works and returns request metadata
    """
    # Act
    response = api_session.get(f"{httpbin_base_url}/get")
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    data = response.json()
    assert 'args' in data, "Response missing 'args' field"
    assert 'headers' in data, "Response missing 'headers' field"
    assert 'origin' in data, "Response missing 'origin' field (client IP)"
    assert 'url' in data, "Response missing 'url' field"


@pytest.mark.smoke
@pytest.mark.crud
def test_post_with_json(api_session, httpbin_base_url):
    """
    TC-API-019: POST /post echoes JSON payload
    Verifies: POST request with JSON body
    """
    # Arrange
    payload = {
        "test_key": "test_value",
        "number": 42,
        "nested": {"inner": "data"}
    }
    
    # Act
    response = api_session.post(f"{httpbin_base_url}/post", json=payload)
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    data = response.json()
    assert 'json' in data, "Response missing 'json' field"
    assert data['json'] == payload, "Echoed JSON doesn't match sent payload"
    assert 'headers' in data
    assert 'Content-Type' in data['headers']


@pytest.mark.crud
def test_put_request(api_session, httpbin_base_url):
    """
    TC-API-020: PUT /put handles update request
    Verifies: PUT method works correctly
    """
    # Arrange
    payload = {"action": "update", "data": "test"}
    
    # Act
    response = api_session.put(f"{httpbin_base_url}/put", json=payload)
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    data = response.json()
    assert 'json' in data
    assert data['json'] == payload


@pytest.mark.crud
def test_delete_request(api_session, httpbin_base_url):
    """
    TC-API-021: DELETE /delete confirms deletion
    Verifies: DELETE method works correctly
    """
    # Act
    response = api_session.delete(f"{httpbin_base_url}/delete")
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    data = response.json()
    assert 'args' in data
    assert 'headers' in data


@pytest.mark.smoke
def test_status_code_404(api_session, httpbin_base_url):
    """
    TC-API-022: GET /status/404 returns 404 status
    Verifies: Status code endpoint simulation
    """
    # Act
    response = api_session.get(f"{httpbin_base_url}/status/404")
    
    # Assert
    assert response.status_code == 404, f"Expected 404, got {response.status_code}"


@pytest.mark.negative
def test_status_code_500(api_session, httpbin_base_url):
    """
    GET /status/500 returns 500 status
    Verifies: Server error simulation
    """
    # Act
    response = api_session.get(f"{httpbin_base_url}/status/500")
    
    # Assert
    assert response.status_code == 500, f"Expected 500, got {response.status_code}"


@pytest.mark.regression
def test_headers_validation(api_session, httpbin_base_url):
    """
    TC-API-023: GET /headers returns request headers
    Verifies: Header inspection and custom headers
    """
    # Arrange - add custom header
    custom_headers = {
        'X-Custom-Header': 'test-value',
        'User-Agent': 'QA-Test-Suite/1.0'
    }
    
    # Act
    response = api_session.get(f"{httpbin_base_url}/headers", headers=custom_headers)
    
    # Assert
    assert response.status_code == 200
    
    data = response.json()
    assert 'headers' in data
    assert 'X-Custom-Header' in data['headers']
    assert data['headers']['X-Custom-Header'] == 'test-value'


@pytest.mark.performance
def test_response_delay(api_session, httpbin_base_url):
    """
    TC-API-024: GET /delay/2 waits approximately 2 seconds
    Verifies: Timeout handling and delayed responses
    """
    # Act
    start_time = time.time()
    response = api_session.get(f"{httpbin_base_url}/delay/2", timeout=5)
    elapsed = time.time() - start_time
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert elapsed >= 2.0, f"Expected delay of ~2s, got {elapsed:.2f}s"
    assert elapsed < 3.0, f"Delay too long: {elapsed:.2f}s (expected ~2s)"


@pytest.mark.auth
def test_basic_auth_success(api_session, httpbin_base_url):
    """
    TC-API-025: GET /basic-auth/user/pass with credentials succeeds
    Verifies: Basic authentication mechanism
    """
    # Arrange
    username = 'testuser'
    password = 'testpass'
    
    # Act
    response = api_session.get(
        f"{httpbin_base_url}/basic-auth/{username}/{password}",
        auth=(username, password)
    )
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    data = response.json()
    assert data['authenticated'] is True
    assert data['user'] == username


@pytest.mark.auth
@pytest.mark.negative
def test_basic_auth_failure(api_session, httpbin_base_url):
    """
    GET /basic-auth with wrong credentials returns 401
    Verifies: Authentication failure handling
    """
    # Act - wrong credentials
    response = api_session.get(
        f"{httpbin_base_url}/basic-auth/testuser/testpass",
        auth=('wrong', 'credentials')
    )
    
    # Assert
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"


@pytest.mark.regression
def test_get_with_query_params(api_session, httpbin_base_url):
    """
    GET /get?param1=value1&param2=value2 returns query params
    Verifies: Query parameter handling
    """
    # Arrange
    params = {
        'search': 'testing',
        'limit': '10',
        'offset': '5'
    }
    
    # Act
    response = api_session.get(f"{httpbin_base_url}/get", params=params)
    
    # Assert
    assert response.status_code == 200
    
    data = response.json()
    assert 'args' in data
    assert data['args']['search'] == 'testing'
    assert data['args']['limit'] == '10'
    assert data['args']['offset'] == '5'


@pytest.mark.regression
def test_post_form_data(api_session, httpbin_base_url):
    """
    POST /post with form data
    Verifies: Form-encoded data handling
    """
    # Arrange
    form_data = {
        'field1': 'value1',
        'field2': 'value2'
    }
    
    # Act
    response = api_session.post(f"{httpbin_base_url}/post", data=form_data)
    
    # Assert
    assert response.status_code == 200
    
    data = response.json()
    assert 'form' in data
    assert data['form']['field1'] == 'value1'
    assert data['form']['field2'] == 'value2'


@pytest.mark.regression
def test_user_agent(api_session, httpbin_base_url):
    """
    GET /user-agent returns User-Agent header
    Verifies: User-Agent header handling
    """
    # Act
    response = api_session.get(f"{httpbin_base_url}/user-agent")
    
    # Assert
    assert response.status_code == 200
    
    data = response.json()
    assert 'user-agent' in data
    assert 'QA-Test-Suite' in data['user-agent']


@pytest.mark.regression
def test_gzip_compression(api_session, httpbin_base_url):
    """
    GET /gzip returns gzip compressed response
    Verifies: Compression handling
    """
    # Act
    response = api_session.get(f"{httpbin_base_url}/gzip")
    
    # Assert
    assert response.status_code == 200
    
    data = response.json()
    assert 'gzipped' in data
    assert data['gzipped'] is True


@pytest.mark.regression
def test_response_content_types(api_session, httpbin_base_url):
    """
    GET /json returns JSON content type
    Verifies: Content-Type headers
    """
    # Act
    response = api_session.get(f"{httpbin_base_url}/json")
    
    # Assert
    assert response.status_code == 200
    assert 'application/json' in response.headers['Content-Type']
    
    # Verify it's valid JSON
    data = response.json()
    assert isinstance(data, dict)


@pytest.mark.negative
def test_invalid_http_method(api_session, httpbin_base_url):
    """
    Unsupported HTTP method on endpoint
    Verifies: Method not allowed handling
    """
    # Act - try PATCH on /get endpoint (not supported)
    response = api_session.patch(f"{httpbin_base_url}/get")
    
    # Assert - should return 405 Method Not Allowed
    assert response.status_code == 405, f"Expected 405, got {response.status_code}"


@pytest.mark.negative
def test_request_with_empty_body(api_session, httpbin_base_url):
    """
    POST with empty body
    Verifies: Handling of empty request bodies
    """
    # Act
    response = api_session.post(f"{httpbin_base_url}/post", json={})
    
    # Assert
    assert response.status_code == 200
    
    data = response.json()
    assert 'json' in data
    assert data['json'] == {}


@pytest.mark.regression
def test_uuid_generation(api_session, httpbin_base_url):
    """
    GET /uuid returns valid UUID
    Verifies: UUID generation endpoint
    """
    # Act
    response = api_session.get(f"{httpbin_base_url}/uuid")
    
    # Assert
    assert response.status_code == 200
    
    data = response.json()
    assert 'uuid' in data
    
    # Verify UUID format (8-4-4-4-12 hex characters)
    uuid = data['uuid']
    parts = uuid.split('-')
    assert len(parts) == 5
    assert len(parts[0]) == 8
    assert len(parts[1]) == 4
    assert len(parts[2]) == 4
    assert len(parts[3]) == 4
    assert len(parts[4]) == 12


@pytest.mark.negative
def test_pagination_edge_case_zero(api_session, reqres_base_url):
    """
    TC-API-028: GET /users?page=0 edge case
    Verifies: Pagination boundary handling
    """
    # Act
    response = api_session.get(f"{reqres_base_url}/users?page=0")
    
    # Assert - API should handle gracefully (return data or error)
    assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}"
    
    if response.status_code == 200:
        data = response.json()
        # Should return valid response structure
        assert 'data' in data


@pytest.mark.negative
def test_pagination_negative_page(api_session, reqres_base_url):
    """
    GET /users?page=-1 with negative page number
    Verifies: Negative pagination handling
    """
    # Act
    response = api_session.get(f"{reqres_base_url}/users?page=-1")
    
    # Assert
    assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}"

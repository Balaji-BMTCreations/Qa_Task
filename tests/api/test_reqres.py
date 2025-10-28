"""
API Tests for reqres.in
Tests user management endpoints: CRUD operations, authentication, pagination
"""

import pytest
import requests


@pytest.mark.smoke
@pytest.mark.crud
def test_list_users_with_pagination(api_session, reqres_base_url, assert_response_time):
    """
    TC-API-001: GET /api/users?page=2 returns paginated users
    Verifies: Status 200, pagination metadata, user array
    """
    # Act
    response = api_session.get(f"{reqres_base_url}/users?page=2")
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert_response_time(response, max_time_ms=500)
    
    data = response.json()
    assert 'page' in data, "Response missing 'page' field"
    assert data['page'] == 2, f"Expected page 2, got {data['page']}"
    assert 'data' in data, "Response missing 'data' field"
    assert isinstance(data['data'], list), "'data' should be a list"
    assert len(data['data']) > 0, "User list should not be empty"
    
    # Verify pagination metadata
    assert 'total_pages' in data
    assert 'per_page' in data
    assert 'total' in data


@pytest.mark.smoke
@pytest.mark.crud
def test_get_single_user(api_session, reqres_base_url, user_schema, assert_json_schema):
    """
    TC-API-002: GET /api/users/2 returns correct user object
    Verifies: Status 200, user object structure, JSON schema compliance
    """
    # Act
    response = api_session.get(f"{reqres_base_url}/users/2")
    
    # Assert
    assert response.status_code == 200
    
    data = response.json()
    assert 'data' in data, "Response missing 'data' wrapper"
    
    user = data['data']
    assert user['id'] == 2, f"Expected user ID 2, got {user['id']}"
    assert 'email' in user
    assert 'first_name' in user
    assert 'last_name' in user
    assert 'avatar' in user
    
    # Validate against JSON schema
    assert_json_schema(user, user_schema)


@pytest.mark.negative
def test_user_not_found(api_session, reqres_base_url):
    """
    TC-API-003: GET /api/users/999 returns 404 status
    Verifies: Proper error handling for non-existent resources
    """
    # Act
    response = api_session.get(f"{reqres_base_url}/users/999")
    
    # Assert
    assert response.status_code == 404, f"Expected 404, got {response.status_code}"


@pytest.mark.crud
def test_create_user(api_session, reqres_base_url, valid_user_payload):
    """
    TC-API-004: POST /api/users with valid payload returns 201
    Verifies: User creation, response includes ID and timestamp
    """
    # Act
    response = api_session.post(f"{reqres_base_url}/users", json=valid_user_payload)
    
    # Assert
    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    
    data = response.json()
    assert 'id' in data, "Response missing 'id' field"
    assert 'createdAt' in data, "Response missing 'createdAt' timestamp"
    assert data['name'] == valid_user_payload['name']
    assert data['job'] == valid_user_payload['job']


@pytest.mark.crud
def test_update_user_put(api_session, reqres_base_url):
    """
    TC-API-005: PUT /api/users/2 updates user successfully
    Verifies: Full resource update, includes updatedAt timestamp
    """
    # Arrange
    update_payload = {
        "name": "Updated Name",
        "job": "Updated Job Title"
    }
    
    # Act
    response = api_session.put(f"{reqres_base_url}/users/2", json=update_payload)
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    data = response.json()
    assert 'updatedAt' in data, "Response missing 'updatedAt' timestamp"
    assert data['name'] == update_payload['name']
    assert data['job'] == update_payload['job']


@pytest.mark.crud
def test_update_user_patch(api_session, reqres_base_url):
    """
    TC-API-006: PATCH /api/users/2 partial update works
    Verifies: Partial resource update with only changed fields
    """
    # Arrange
    partial_payload = {
        "job": "Senior QA Engineer"
    }
    
    # Act
    response = api_session.patch(f"{reqres_base_url}/users/2", json=partial_payload)
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    data = response.json()
    assert 'updatedAt' in data
    assert data['job'] == partial_payload['job']


@pytest.mark.crud
def test_delete_user(api_session, reqres_base_url):
    """
    TC-API-007: DELETE /api/users/2 returns 204
    Verifies: Successful deletion with no content returned
    """
    # Act
    response = api_session.delete(f"{reqres_base_url}/users/2")
    
    # Assert
    assert response.status_code == 204, f"Expected 204, got {response.status_code}"
    assert response.text == '', "Delete should return empty body"


@pytest.mark.schema
def test_user_list_schema_validation(api_session, reqres_base_url):
    """
    TC-API-008: Verify user object matches JSON schema
    Verifies: All users in list conform to expected schema
    """
    # Act
    response = api_session.get(f"{reqres_base_url}/users?page=1")
    
    # Assert
    assert response.status_code == 200
    
    data = response.json()
    users = data['data']
    
    # Validate each user against schema
    for user in users:
        assert 'id' in user
        assert 'email' in user
        assert '@' in user['email'], f"Invalid email format: {user['email']}"
        assert 'first_name' in user
        assert 'last_name' in user
        assert 'avatar' in user
        assert user['avatar'].startswith('http'), "Avatar should be a valid URL"


@pytest.mark.auth
def test_register_successful(api_session, reqres_base_url):
    """
    TC-API-009: POST /api/register with valid data returns token
    Verifies: Successful registration returns auth token
    """
    # Arrange
    payload = {
        "email": "eve.holt@reqres.in",
        "password": "pistol"
    }
    
    # Act
    response = api_session.post(f"{reqres_base_url}/register", json=payload)
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    data = response.json()
    assert 'id' in data, "Response missing 'id' field"
    assert 'token' in data, "Response missing 'token' field"
    assert isinstance(data['token'], str), "Token should be a string"
    assert len(data['token']) > 0, "Token should not be empty"


@pytest.mark.auth
@pytest.mark.negative
def test_register_missing_field(api_session, reqres_base_url):
    """
    TC-API-010: POST /api/register without password returns 400
    Verifies: Validation error for missing required field
    """
    # Arrange - missing password
    payload = {
        "email": "eve.holt@reqres.in"
    }
    
    # Act
    response = api_session.post(f"{reqres_base_url}/register", json=payload)
    
    # Assert
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    data = response.json()
    assert 'error' in data, "Error response should include 'error' field"


@pytest.mark.auth
def test_login_successful(api_session, reqres_base_url):
    """
    TC-API-011: POST /api/login returns auth token
    Verifies: Successful authentication returns token
    """
    # Arrange
    payload = {
        "email": "eve.holt@reqres.in",
        "password": "cityslicka"
    }
    
    # Act
    response = api_session.post(f"{reqres_base_url}/login", json=payload)
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    data = response.json()
    assert 'token' in data, "Response missing 'token' field"
    assert len(data['token']) > 0, "Token should not be empty"


@pytest.mark.auth
@pytest.mark.negative
def test_login_invalid_credentials(api_session, reqres_base_url):
    """
    TC-API-012: POST /api/login with bad credentials returns 400
    Verifies: Authentication failure for invalid credentials
    """
    # Arrange - missing password
    payload = {
        "email": "eve.holt@reqres.in"
    }
    
    # Act
    response = api_session.post(f"{reqres_base_url}/login", json=payload)
    
    # Assert
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    data = response.json()
    assert 'error' in data, "Error response should include 'error' field"

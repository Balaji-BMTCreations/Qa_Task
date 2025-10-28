"""
API Tests for JSONPlaceholder
Tests posts, comments, todos endpoints with CRUD operations and filtering
"""

import pytest
import requests


@pytest.mark.smoke
@pytest.mark.crud
def test_get_all_posts(api_session, jsonplaceholder_base_url, assert_response_time):
    """
    TC-API-013: GET /posts returns 100 posts
    Verifies: Status 200, returns expected number of posts
    """
    # Act
    response = api_session.get(f"{jsonplaceholder_base_url}/posts")
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert_response_time(response, max_time_ms=1000)
    
    posts = response.json()
    assert isinstance(posts, list), "Response should be a list"
    assert len(posts) == 100, f"Expected 100 posts, got {len(posts)}"


@pytest.mark.smoke
@pytest.mark.crud
def test_get_single_post(api_session, jsonplaceholder_base_url, post_schema, assert_json_schema):
    """
    TC-API-014: GET /posts/1 returns specific post
    Verifies: Status 200, post structure, schema compliance
    """
    # Act
    response = api_session.get(f"{jsonplaceholder_base_url}/posts/1")
    
    # Assert
    assert response.status_code == 200
    
    post = response.json()
    assert post['id'] == 1, f"Expected post ID 1, got {post['id']}"
    assert 'userId' in post
    assert 'title' in post
    assert 'body' in post
    
    # Validate against schema
    assert_json_schema(post, post_schema)


@pytest.mark.crud
def test_filter_posts_by_user(api_session, jsonplaceholder_base_url):
    """
    TC-API-015: GET /posts?userId=1 returns user's posts
    Verifies: Query parameter filtering works correctly
    """
    # Act
    response = api_session.get(f"{jsonplaceholder_base_url}/posts?userId=1")
    
    # Assert
    assert response.status_code == 200
    
    posts = response.json()
    assert isinstance(posts, list)
    assert len(posts) > 0, "User should have at least one post"
    
    # Verify all posts belong to userId 1
    for post in posts:
        assert post['userId'] == 1, f"Post userId mismatch: {post['userId']}"


@pytest.mark.crud
def test_create_post(api_session, jsonplaceholder_base_url, valid_post_payload):
    """
    TC-API-016: POST /posts with payload returns 201
    Verifies: Post creation returns ID and echoes payload
    """
    # Act
    response = api_session.post(f"{jsonplaceholder_base_url}/posts", json=valid_post_payload)
    
    # Assert
    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    
    data = response.json()
    assert 'id' in data, "Response missing 'id' field"
    assert data['userId'] == valid_post_payload['userId']
    assert data['title'] == valid_post_payload['title']
    assert data['body'] == valid_post_payload['body']


@pytest.mark.negative
def test_invalid_post_id(api_session, jsonplaceholder_base_url):
    """
    TC-API-017: GET /posts/999999 returns empty or 404
    Verifies: Proper handling of non-existent resource
    """
    # Act
    response = api_session.get(f"{jsonplaceholder_base_url}/posts/999999")
    
    # Assert
    # JSONPlaceholder returns 404 or empty object for invalid IDs
    assert response.status_code in [200, 404], f"Expected 200 or 404, got {response.status_code}"
    
    if response.status_code == 200:
        data = response.json()
        # Empty object or null for non-existent resource
        assert data == {} or data is None


@pytest.mark.crud
def test_update_post(api_session, jsonplaceholder_base_url):
    """
    PUT /posts/1 updates post successfully
    Verifies: Full resource update
    """
    # Arrange
    update_payload = {
        "userId": 1,
        "id": 1,
        "title": "Updated Post Title",
        "body": "This is an updated post body."
    }
    
    # Act
    response = api_session.put(f"{jsonplaceholder_base_url}/posts/1", json=update_payload)
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    data = response.json()
    assert data['title'] == update_payload['title']
    assert data['body'] == update_payload['body']


@pytest.mark.crud
def test_delete_post(api_session, jsonplaceholder_base_url):
    """
    DELETE /posts/1 returns success
    Verifies: Successful deletion
    """
    # Act
    response = api_session.delete(f"{jsonplaceholder_base_url}/posts/1")
    
    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"


@pytest.mark.smoke
def test_get_comments_for_post(api_session, jsonplaceholder_base_url):
    """
    GET /posts/1/comments returns associated comments
    Verifies: Nested resource retrieval
    """
    # Act
    response = api_session.get(f"{jsonplaceholder_base_url}/posts/1/comments")
    
    # Assert
    assert response.status_code == 200
    
    comments = response.json()
    assert isinstance(comments, list)
    assert len(comments) > 0, "Post should have comments"
    
    # Verify comment structure
    first_comment = comments[0]
    assert 'postId' in first_comment
    assert first_comment['postId'] == 1
    assert 'id' in first_comment
    assert 'email' in first_comment
    assert 'name' in first_comment
    assert 'body' in first_comment


@pytest.mark.crud
def test_filter_comments_by_post(api_session, jsonplaceholder_base_url):
    """
    GET /comments?postId=1 filters comments
    Verifies: Query parameter filtering for comments
    """
    # Act
    response = api_session.get(f"{jsonplaceholder_base_url}/comments?postId=1")
    
    # Assert
    assert response.status_code == 200
    
    comments = response.json()
    assert isinstance(comments, list)
    
    # Verify all comments belong to postId 1
    for comment in comments:
        assert comment['postId'] == 1


@pytest.mark.smoke
def test_get_todos(api_session, jsonplaceholder_base_url):
    """
    GET /todos returns todo items
    Verifies: Todo endpoint works correctly
    """
    # Act
    response = api_session.get(f"{jsonplaceholder_base_url}/todos")
    
    # Assert
    assert response.status_code == 200
    
    todos = response.json()
    assert isinstance(todos, list)
    assert len(todos) == 200, f"Expected 200 todos, got {len(todos)}"
    
    # Verify todo structure
    first_todo = todos[0]
    assert 'userId' in first_todo
    assert 'id' in first_todo
    assert 'title' in first_todo
    assert 'completed' in first_todo
    assert isinstance(first_todo['completed'], bool)


@pytest.mark.negative
def test_create_post_with_missing_fields(api_session, jsonplaceholder_base_url):
    """
    POST /posts with incomplete data
    Verifies: API accepts partial data (lenient validation)
    """
    # Arrange - missing body field
    incomplete_payload = {
        "userId": 1,
        "title": "Post without body"
    }
    
    # Act
    response = api_session.post(f"{jsonplaceholder_base_url}/posts", json=incomplete_payload)
    
    # Assert
    # JSONPlaceholder is lenient and accepts partial data
    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    
    data = response.json()
    assert 'id' in data


@pytest.mark.negative
def test_malformed_json_payload(api_session, jsonplaceholder_base_url):
    """
    POST with invalid JSON
    Verifies: Error handling for malformed requests
    """
    # Act - send malformed JSON as string
    headers = {'Content-Type': 'application/json'}
    response = api_session.post(
        f"{jsonplaceholder_base_url}/posts",
        data="{invalid json}",
        headers=headers
    )
    
    # Assert
    # Should return error (400 or 500)
    assert response.status_code in [400, 500, 422], f"Expected error status, got {response.status_code}"


@pytest.mark.schema
def test_post_schema_compliance(api_session, jsonplaceholder_base_url, post_schema, assert_json_schema):
    """
    Verify multiple posts conform to schema
    Verifies: Consistent data structure across all posts
    """
    # Act
    response = api_session.get(f"{jsonplaceholder_base_url}/posts?_limit=10")
    
    # Assert
    assert response.status_code == 200
    
    posts = response.json()
    
    # Validate each post against schema
    for post in posts:
        assert_json_schema(post, post_schema)


@pytest.mark.regression
def test_filter_todos_by_completion_status(api_session, jsonplaceholder_base_url):
    """
    GET /todos?completed=true filters completed todos
    Verifies: Boolean query parameter filtering
    """
    # Act
    response = api_session.get(f"{jsonplaceholder_base_url}/todos?completed=true")
    
    # Assert
    assert response.status_code == 200
    
    todos = response.json()
    assert isinstance(todos, list)
    
    # Verify all todos are completed
    for todo in todos:
        assert todo['completed'] is True, f"Todo {todo['id']} should be completed"


@pytest.mark.performance
def test_response_headers(api_session, jsonplaceholder_base_url):
    """
    Verify response headers are present
    Verifies: CORS, content-type, cache headers
    """
    # Act
    response = api_session.get(f"{jsonplaceholder_base_url}/posts/1")
    
    # Assert
    assert response.status_code == 200
    
    # Check important headers
    assert 'content-type' in response.headers
    assert 'application/json' in response.headers['content-type']
    
    # Check CORS headers
    assert 'access-control-allow-origin' in response.headers

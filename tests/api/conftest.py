"""
Pytest fixtures and configuration for API tests
Provides reusable components for testing public APIs
"""

import pytest
import requests
from typing import Generator
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Base URLs for different APIs
API_ENDPOINTS = {
    'reqres': 'https://reqres.in/api',
    'jsonplaceholder': 'https://jsonplaceholder.typicode.com',
    'httpbin': 'https://httpbin.org'
}


@pytest.fixture(scope='session')
def api_session() -> Generator[requests.Session, None, None]:
    """
    Creates a requests session for efficient connection pooling
    Scope: session (shared across all tests)
    """
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'QA-Test-Suite/1.0',
        'Accept': 'application/json'
    })
    
    yield session
    
    session.close()


@pytest.fixture
def reqres_base_url() -> str:
    """Returns base URL for reqres.in API"""
    return API_ENDPOINTS['reqres']


@pytest.fixture
def jsonplaceholder_base_url() -> str:
    """Returns base URL for JSONPlaceholder API"""
    return API_ENDPOINTS['jsonplaceholder']


@pytest.fixture
def httpbin_base_url() -> str:
    """Returns base URL for httpbin.org API"""
    return API_ENDPOINTS['httpbin']


@pytest.fixture
def valid_user_payload() -> dict:
    """Returns valid user payload for POST/PUT requests"""
    return {
        "name": "QA Test User",
        "job": "Test Engineer"
    }


@pytest.fixture
def valid_post_payload() -> dict:
    """Returns valid post payload for JSONPlaceholder"""
    return {
        "userId": 1,
        "title": "Test Post Title",
        "body": "This is a test post body created by automated tests."
    }


def pytest_configure(config):
    """Custom pytest configuration"""
    logger.info("=" * 80)
    logger.info("Starting API Test Suite")
    logger.info(f"Testing endpoints: {', '.join(API_ENDPOINTS.keys())}")
    logger.info("=" * 80)


def pytest_collection_finish(session):
    """Called after test collection is complete"""
    logger.info(f"Collected {len(session.items)} test cases")


def pytest_runtest_logreport(report):
    """Log test results"""
    if report.when == 'call':
        if report.passed:
            logger.info(f"✓ PASSED: {report.nodeid}")
        elif report.failed:
            logger.error(f"✗ FAILED: {report.nodeid}")
        elif report.skipped:
            logger.warning(f"⊘ SKIPPED: {report.nodeid}")


@pytest.fixture
def assert_response_time():
    """Helper fixture to assert response time is acceptable"""
    def _assert(response: requests.Response, max_time_ms: int = 2000):
        elapsed_ms = response.elapsed.total_seconds() * 1000
        assert elapsed_ms < max_time_ms, f"Response time {elapsed_ms}ms exceeded {max_time_ms}ms threshold"
        return elapsed_ms
    return _assert


@pytest.fixture
def assert_json_schema():
    """Helper fixture to validate JSON schema"""
    from jsonschema import validate, ValidationError
    
    def _assert(data: dict, schema: dict):
        try:
            validate(instance=data, schema=schema)
            return True
        except ValidationError as e:
            pytest.fail(f"JSON schema validation failed: {e.message}")
    
    return _assert


# JSON Schemas for validation
USER_SCHEMA = {
    "type": "object",
    "properties": {
        "id": {"type": "integer"},
        "email": {"type": "string", "format": "email"},
        "first_name": {"type": "string"},
        "last_name": {"type": "string"},
        "avatar": {"type": "string"}
    },
    "required": ["id", "email", "first_name", "last_name"]
}


POST_SCHEMA = {
    "type": "object",
    "properties": {
        "userId": {"type": "integer"},
        "id": {"type": "integer"},
        "title": {"type": "string"},
        "body": {"type": "string"}
    },
    "required": ["userId", "id", "title", "body"]
}


@pytest.fixture
def user_schema() -> dict:
    """Returns JSON schema for user object validation"""
    return USER_SCHEMA


@pytest.fixture
def post_schema() -> dict:
    """Returns JSON schema for post object validation"""
    return POST_SCHEMA

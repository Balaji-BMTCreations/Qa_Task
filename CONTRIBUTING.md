# Contributing Guide

## Welcome

Thank you for your interest in contributing to this QA portfolio project! This guide will help you understand our testing standards, development workflow, and contribution process.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Testing Standards](#testing-standards)
5. [Code Style](#code-style)
6. [Pull Request Process](#pull-request-process)
7. [Continuous Integration](#continuous-integration)

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (for web tests)
- **Python** 3.8+ (for API tests)
- **Git**
- **Code Editor** (VS Code recommended)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Balaji-BMTCreations/Qa_Task.git
cd Qa_Task

# Install web test dependencies
cd tests/web-e2e
npm install
npx playwright install

# Install API test dependencies
cd ../api
pip install -r requirements.txt

# Verify installation
npm test  # In web-e2e directory
pytest    # In api directory
```

---

## Project Structure

```
.
├── strategy/              # Test planning documents
│   ├── test-strategy.md   # Master test strategy
│   └── traceability-matrix.md
├── tests/
│   ├── web-e2e/          # Playwright browser tests
│   │   ├── tests/        # Test specifications
│   │   └── playwright.config.ts
│   └── api/              # API test suite
│       ├── test_*.py     # Test modules
│       ├── conftest.py   # Shared fixtures
│       └── pytest.ini
├── agent-evals/          # AI agent testing
│   ├── prompts.md
│   └── rubric.md
├── performance/          # Load testing
│   └── load-test.js
├── reports/              # Bug documentation
└── .github/workflows/    # CI/CD automation
```

---

## Development Workflow

### Branching Strategy

```
main          (production-ready code)
  ↓
develop       (integration branch)
  ↓
feature/*     (new tests, features)
bugfix/*      (bug fixes)
docs/*        (documentation updates)
```

### Workflow Steps

1. **Create Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/add-login-tests
   ```

2. **Make Changes**
   - Write tests following standards
   - Update documentation
   - Run tests locally

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Add comprehensive login validation tests"
   ```

4. **Push & Create PR**
   ```bash
   git push origin feature/add-login-tests
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New test or feature
- `fix`: Bug fix in tests
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding missing tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(web): Add shopping cart persistence tests
fix(api): Correct schema validation for user endpoint
docs(readme): Update installation instructions
refactor(api): Extract common fixtures to conftest
```

---

## Testing Standards

### Web E2E Tests (Playwright)

**Test Structure:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  
  test.beforeEach(async ({ page }) => {
    // Common setup
  });

  test('TC-WEB-XXX: Clear test description', async ({ page }) => {
    // Arrange
    const username = 'test_user';
    
    // Act
    await page.fill('[data-test="username"]', username);
    await page.click('[data-test="login-button"]');
    
    // Assert
    await expect(page).toHaveURL('/dashboard');
  });
});
```

**Best Practices:**
- ✅ Use `data-test` attributes for selectors
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Write descriptive test names with TC-WEB-XXX IDs
- ✅ Add comments for complex logic
- ✅ Use explicit waits (avoid `waitForTimeout`)
- ❌ Don't use brittle selectors (CSS classes that may change)
- ❌ Don't create test dependencies (tests should be isolated)

### API Tests (Pytest)

**Test Structure:**
```python
import pytest

@pytest.mark.smoke
@pytest.mark.crud
def test_create_user(api_session, reqres_base_url, valid_user_payload):
    """
    TC-API-XXX: Description of what is being tested
    Verifies: Expected behavior
    """
    # Arrange
    payload = valid_user_payload
    
    # Act
    response = api_session.post(f"{reqres_base_url}/users", json=payload)
    
    # Assert
    assert response.status_code == 201
    assert 'id' in response.json()
```

**Best Practices:**
- ✅ Use pytest markers for categorization
- ✅ Add clear docstrings with TC-API-XXX IDs
- ✅ Use fixtures for common setup
- ✅ Test both happy and unhappy paths
- ✅ Validate response schemas
- ❌ Don't hardcode URLs (use fixtures)
- ❌ Don't leave test data behind (cleanup in teardown)

### Test Naming Convention

| Test Type | Format | Example |
|-----------|--------|---------|
| Web E2E | `TC-WEB-XXX: Action + Expected Result` | `TC-WEB-001: Login with valid credentials` |
| API | `TC-API-XXX: Endpoint + Operation` | `TC-API-015: GET /posts filters by user` |
| Agent | `TC-AGT-XXX: Capability Tested` | `TC-AGT-004: JSON schema adherence` |

---

## Code Style

### TypeScript (Playwright)

Follow the existing `.editorconfig` and use Prettier:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Run Prettier:**
```bash
npm run format
```

### Python (Pytest)

Follow PEP 8 with these settings:

```ini
[flake8]
max-line-length = 100
exclude = __pycache__,.pytest_cache
```

**Run Linting:**
```bash
flake8 tests/api/
black tests/api/ --check
```

---

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Code follows style guidelines
- [ ] No console.log or debug statements
- [ ] Branch is up to date with develop

**Run Pre-Commit Checks:**
```bash
# Web tests
cd tests/web-e2e
npm test
npm run lint

# API tests
cd tests/api
pytest
flake8 .
```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New test coverage
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring

## Test Cases Added/Modified
- TC-WEB-XXX: Description
- TC-API-XXX: Description

## Checklist
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Follows code style
- [ ] Traceability matrix updated

## Screenshots (if applicable)
[Add screenshots for visual changes]
```

### Review Process

1. **Automated Checks** - CI runs all tests
2. **Code Review** - At least 1 approval required
3. **Merge** - Squash and merge to develop

---

## Continuous Integration

### GitHub Actions Workflows

**Triggers:**
- Push to main/develop
- Pull requests
- Scheduled (daily/weekly)
- Manual dispatch

**Workflows:**
1. **web-e2e-tests.yml** - Playwright tests across browsers
2. **api-tests.yml** - Pytest suite with multiple Python versions
3. **performance-tests.yml** - k6 load tests and Lighthouse audits

### Local CI Simulation

Run what CI will run:

```bash
# Web E2E
cd tests/web-e2e
npm ci
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# API
cd tests/api
pip install -r requirements.txt
pytest -v --html=report.html

# Performance (optional, respects rate limits)
cd performance
k6 run load-test.js
```

---

## Adding New Tests

### Web E2E Test

1. **Identify test case** from traceability matrix
2. **Create test file** or add to existing spec
3. **Write test** following standards
4. **Run locally**
   ```bash
   npx playwright test <test-file>.spec.ts
   ```
5. **Update documentation**
   - Add to traceability matrix
   - Update README if needed

### API Test

1. **Identify endpoint** to test
2. **Add test function** to appropriate file
3. **Add markers** (`@pytest.mark.smoke`, etc.)
4. **Run locally**
   ```bash
   pytest tests/api/test_<module>.py::test_<function> -v
   ```
5. **Update documentation**

---

## Bug Reports

When finding bugs, document using the template:

```bash
cp reports/bug-template.md reports/bug-XXX-description.md
```

Fill out all sections:
- Title, Environment, Steps to Reproduce
- Expected vs Actual Results
- Evidence (screenshots, logs)
- Severity & Priority
- Root cause analysis
- Suggested fix

---

## Documentation

### When to Update Docs

- Adding new test types or frameworks
- Changing project structure
- Modifying CI/CD workflows
- Updating dependencies

### Documentation Files

- **README.md** - Project overview, quick start
- **strategy/test-strategy.md** - Test approach
- **strategy/traceability-matrix.md** - Test coverage mapping
- **CONTRIBUTING.md** (this file) - Developer guidelines
- **QUICK-REFERENCE.md** - Command cheat sheet

---

## Questions & Support

**Need Help?**
- Check existing documentation
- Review similar test implementations
- Ask in pull request comments
- Refer to framework docs (Playwright, Pytest)

**Found a Bug?**
- Open an issue with bug report template
- Include reproduction steps
- Tag with appropriate labels

---

## Recognition

Contributors will be acknowledged in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to quality! 🎯

---

**Last Updated:** October 2025

# Quick Reference Guide

Fast command reference for running tests and common operations.

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd personal-website

# Web tests
cd tests/web-e2e && npm install && npx playwright install

# API tests
cd tests/api && pip install -r requirements.txt
```

---

## 🎭 Web E2E Tests (Playwright)

### Run All Tests
```bash
cd tests/web-e2e
npm test
```

### Run Specific Test File
```bash
npx playwright test authentication.spec.ts
npx playwright test shopping-cart.spec.ts
npx playwright test product-catalog.spec.ts
npx playwright test accessibility.spec.ts
```

### Run by Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Specific Test
```bash
npx playwright test -g "Login with valid credentials"
npx playwright test shopping-cart.spec.ts -g "Add single item"
```

### Debug Mode
```bash
npx playwright test --debug
npx playwright test --headed  # See browser
npx playwright test --ui       # Interactive mode
```

### View Reports
```bash
npx playwright show-report
```

### Update Snapshots
```bash
npx playwright test --update-snapshots
```

---

## 🧪 API Tests (Pytest)

### Run All Tests
```bash
cd tests/api
pytest
```

### Run with Verbose Output
```bash
pytest -v
pytest -vv  # Extra verbose
```

### Run Specific File
```bash
pytest test_reqres.py
pytest test_jsonplaceholder.py
pytest test_httpbin.py
```

### Run Specific Test
```bash
pytest test_reqres.py::test_list_users_with_pagination
pytest -k "test_login"  # Pattern matching
```

### Run by Marker
```bash
pytest -m smoke        # Smoke tests only
pytest -m crud         # CRUD operations
pytest -m negative     # Negative tests
pytest -m "smoke or regression"  # Combined
```

### Generate Reports
```bash
pytest --html=report.html --self-contained-html
pytest --json-report --json-report-file=results.json
```

### Show Print Statements
```bash
pytest -s
```

### Stop on First Failure
```bash
pytest -x
```

### Run Last Failed
```bash
pytest --lf
```

### Coverage Report
```bash
pytest --cov=. --cov-report=html
```

---

## 📊 Performance Tests (k6)

### Run Load Test
```bash
cd performance
k6 run load-test.js
```

### Save Results
```bash
k6 run --out json=results.json load-test.js
```

### Custom Duration
```bash
k6 run --duration 30s load-test.js
k6 run --vus 1 --duration 60s load-test.js
```

### Verbose Output
```bash
k6 run --verbose load-test.js
```

---

## 🤖 Agent Evaluations

### Execute Prompts
Manual execution in ChatGPT-4 web interface:
1. Copy prompt from `agent-evals/prompts.md`
2. Paste in ChatGPT
3. Record response
4. Score using `agent-evals/rubric.md`

### Results Location
```
agent-evals/evidence/test-results-summary.md
```

---

## 🐛 Bug Reports

### Create New Bug Report
```bash
cp reports/bug-template.md reports/bug-XXX-description.md
```

### View Existing Bugs
```bash
ls reports/bug-*.md
```

---

## 📝 Documentation

### View Test Strategy
```bash
cat strategy/test-strategy.md
```

### View Traceability Matrix
```bash
cat strategy/traceability-matrix.md
```

### View Performance Plan
```bash
cat performance/perf-plan.md
```

---

## 🔄 CI/CD

### Trigger Workflows (GitHub Actions)

**Via Git Push:**
```bash
git push origin main        # Triggers all tests
git push origin develop     # Triggers all tests
```

**Manual Trigger:**
- Go to Actions tab in GitHub
- Select workflow
- Click "Run workflow"

### Check Workflow Status
```bash
gh run list  # GitHub CLI
gh run view <run-id>
```

---

## 🛠️ Development

### Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-new-test
```

### Commit Changes
```bash
git add .
git commit -m "feat(web): Add new test for feature X"
git push origin feature/my-new-test
```

### Update Branch
```bash
git fetch origin
git rebase origin/develop
```

---

## 🔍 Debugging

### Playwright Debugging
```bash
# Open trace viewer
npx playwright show-trace trace.zip

# Generate trace
npx playwright test --trace on

# Screenshot on failure (already enabled)
# Check test-results/ folder
```

### Pytest Debugging
```bash
# Drop into debugger on failure
pytest --pdb

# Start debugger at test beginning
pytest --trace

# Show local variables
pytest -l

# Verbose error messages
pytest -vv --tb=long
```

### Check Logs
```bash
# Playwright logs
cat tests/web-e2e/test-results/*/stdout

# Pytest logs
pytest --log-cli-level=DEBUG
```

---

## 🧹 Cleanup

### Remove Test Artifacts
```bash
# Web E2E
rm -rf tests/web-e2e/test-results
rm -rf tests/web-e2e/playwright-report

# API
rm -rf tests/api/__pycache__
rm -rf tests/api/.pytest_cache
rm tests/api/report.html tests/api/results.json

# Performance
rm performance/results.json
```

### Reset Dependencies
```bash
# Web E2E
cd tests/web-e2e
rm -rf node_modules package-lock.json
npm install

# API
cd tests/api
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

---

## 📦 Installation Commands

### Playwright
```bash
npm install @playwright/test @axe-core/playwright
npx playwright install chromium  # Or firefox, webkit
```

### Pytest
```bash
pip install pytest pytest-html pytest-json-report requests jsonschema
```

### k6
```bash
# macOS
brew install k6

# Linux
sudo apt-get update && sudo apt-get install k6

# Windows
choco install k6
```

---

## 🎯 Common Tasks

### Add New Web Test
1. Create test in `tests/web-e2e/tests/<name>.spec.ts`
2. Follow existing patterns
3. Run: `npx playwright test <name>.spec.ts`
4. Update traceability matrix

### Add New API Test
1. Add function in `tests/api/test_<module>.py`
2. Use fixtures from `conftest.py`
3. Add markers: `@pytest.mark.smoke`
4. Run: `pytest tests/api/test_<module>.py::test_<name> -v`

### Add New Bug Report
1. Copy template: `cp reports/bug-template.md reports/bug-XXX-name.md`
2. Fill all sections
3. Add screenshots to evidence
4. Link in traceability matrix

---

## 📊 Test Counts

| Category | Count |
|----------|-------|
| Web E2E Tests | 42 |
| API Tests | 56 |
| Agent Evaluations | 14 |
| Bug Reports | 4 |
| Performance Scenarios | 3 |

---

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `strategy/test-strategy.md` | Test approach |
| `strategy/traceability-matrix.md` | Coverage matrix |
| `CONTRIBUTING.md` | Developer guide |
| `SUBMISSION-CHECKLIST.md` | Final review |
| `.github/workflows/*.yml` | CI/CD config |

---

## 🆘 Help Commands

### Playwright
```bash
npx playwright --help
npx playwright test --help
npx playwright codegen  # Record tests
```

### Pytest
```bash
pytest --help
pytest --markers  # List available markers
pytest --fixtures  # List available fixtures
```

### k6
```bash
k6 --help
k6 run --help
```

---

## 📞 Support

**Documentation:**
- [Playwright Docs](https://playwright.dev/)
- [Pytest Docs](https://docs.pytest.org/)
- [k6 Docs](https://k6.io/docs/)

**Issues:**
- Check existing docs first
- Open GitHub issue with template
- Tag appropriately

---

**Last Updated:** October 2025  
**Maintainer:** QA Engineering Team

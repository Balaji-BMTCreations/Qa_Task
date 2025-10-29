# QA Engineering Portfolio - Comprehensive Test Suite

## Overview

This repository demonstrates end-to-end quality assurance capabilities across modern software systems: web applications, RESTful APIs, and agentic AI platforms. The project showcases strategic test planning, automation engineering, and quality ownership.

## Test Targets

- **Web Application**: [Sauce Demo](https://www.saucedemo.com/) - E-commerce platform
- **Public APIs**: 
  - [reqres.in](https://reqres.in/) - User management API
  - [JSONPlaceholder](https://jsonplaceholder.typicode.com/) - Posts, comments, todos
  - [httpbin.org](https://httpbin.org/) - HTTP testing service
- **AI Agent**: ChatGPT-4 (OpenAI) - Conversational AI platform

## Project Structure

```
.
├── strategy/                   # Test strategy and planning documents
│   ├── test-strategy.md       # Comprehensive test strategy (3 pages)
│   └── traceability-matrix.md # Requirements → Test cases mapping
├── tests/
│   ├── web-e2e/               # Playwright E2E tests
│   │   ├── tests/             # Test specifications
│   │   ├── playwright.config.ts
│   │   └── package.json
│   └── api/                   # API test suite
│       ├── test_*.py          # Individual test modules
│       ├── conftest.py        # Pytest fixtures
│       ├── pytest.ini         # Pytest configuration
│       └── requirements.txt   # Python dependencies
├── agent-evals/               # AI agent evaluation
│   ├── prompts.md             # 12 evaluation prompts
│   ├── rubric.md              # Scoring criteria
│   └── evidence/              # Test execution transcripts
├── performance/               # Performance testing
│   ├── load-test.js           # k6 load test script
│   └── perf-plan.md          # Performance strategy
├── reports/                   # Bug reports
│   ├── bug-*.md              # Individual bug reports
│   └── bug-template.md       # Standard template
└── .github/workflows/        # CI/CD automation
```

## Quick Start

### Prerequisites

- **Node.js** 18+ (for web tests)
- **Python** 3.8+ (for API tests)
- **Git**

### Installation & Execution

#### 1. Clone Repository
```bash
git clone https://github.com/Balaji-BMTCreations/Qa_Task.git
cd Qa_Task
```

#### 2. Web E2E Tests (Playwright)
```bash
cd tests/web-e2e
npm install
npx playwright install chromium
npm test                    # Run all tests
npm run test:headed         # Run with browser visible
npm run test:report         # View HTML report
```

#### 3. API Tests (Pytest)
```bash
cd tests/api
pip install -r requirements.txt
pytest                      # Run all tests
pytest -v --html=report.html  # Generate HTML report
pytest -k "test_users"      # Run specific test
```

#### 4. Performance Tests (k6)
```bash
cd performance
# Install k6: https://k6.io/docs/getting-started/installation/
k6 run load-test.js         # Run load test (safe 1 RPS for 60s)
```

## Test Coverage Summary

### Web E2E Tests (5 tests)
- ✅ User authentication (happy & unhappy paths)
- ✅ Shopping cart operations (add, remove, checkout)
- ✅ Product filtering and sorting
- ✅ Negative case: Invalid login attempts
- ✅ Accessibility audit (axe-core integration)

### API Tests (10 tests)
- ✅ User CRUD operations (reqres.in)
- ✅ Authentication validation
- ✅ Pagination and filtering
- ✅ HTTP methods testing (httpbin.org)
- ✅ JSON schema validation
- ✅ Error handling (4xx, 5xx)
- ✅ Rate limit behavior
- ✅ Idempotent test patterns

### Agent Evaluations (12 prompts)
- ✅ Tool use and multi-step reasoning
- ✅ Structured data extraction (JSON schema)
- ✅ Citation fidelity
- ✅ Safety guardrails
- ✅ Instruction following under distraction
- ✅ Multi-turn conversation handling

### Bug Reports (4 documented)
- 🐛 Cart persistence failure on browser refresh
- 🐛 API pagination inconsistency
- 🐛 Agent citation hallucination
- 🐛 [Additional bug documented]

## Key Features

- **Production-Ready**: Stable selectors, retry logic, proper waits
- **CI/CD Ready**: GitHub Actions workflows for automated testing
- **Maintainable**: Page Object Model, DRY fixtures, clear naming
- **Observable**: Detailed reports, screenshots on failure, structured logs
- **Security-Conscious**: No hardcoded secrets, environment variables
- **Resilient**: Idempotent tests, proper cleanup, isolated test data

## Documentation

- [Test Strategy](./strategy/test-strategy.md) - Comprehensive testing approach
- [Traceability Matrix](./strategy/traceability-matrix.md) - Coverage mapping
- [Performance Plan](./performance/perf-plan.md) - Load testing strategy
- [Agent Evaluation Rubric](./agent-evals/rubric.md) - AI assessment criteria
- [Quick Reference](./QUICK-REFERENCE.md) - Command cheat sheet
- [Contributing Guide](./CONTRIBUTING.md) - Development guidelines

## Time Investment

**Total Time Spent**: ~18 hours
- Strategy & Planning: 3 hours
- Web E2E Automation: 4 hours
- API Test Suite: 3 hours
- Agent Evaluations: 3 hours
- Bug Investigation & Reporting: 2 hours
- Performance Testing: 1.5 hours
- Documentation: 1.5 hours

## Assumptions & Trade-offs

1. **Public APIs**: Used free-tier public APIs without authentication complexity
2. **Test Data**: Leveraged existing demo accounts (Sauce Demo) and ephemeral API data
3. **Performance**: Conservative load (1 RPS) to respect public service limits
4. **Agent Testing**: Manual execution due to API cost/rate limits; automated framework ready for internal deployment
5. **Scope**: Focused on critical paths; comprehensive coverage would require domain knowledge and stakeholder input
6. **CI/CD**: Configured for GitHub Actions; adaptable to Jenkins, GitLab CI, or CircleCI
7. **Accessibility**: Single axe-core scan; production requires WCAG 2.1 AA comprehensive audit

## Next Steps for Production

- [ ] Integrate with test management system (TestRail, Zephyr)
- [ ] Add visual regression testing (Percy, Applitools)
- [ ] Implement contract testing (Pact)
- [ ] Expand security testing (OWASP ZAP, dependency scanning)
- [ ] Set up observability (Datadog, Grafana)
- [ ] Define SLOs and error budgets
- [ ] Implement chaos engineering tests

## Contact & Submission

Prepared for: **Wand Synthesis AI Inc** - Senior QA Engineer Position  
Date: October 29, 2025  
Repository: https://github.com/Balaji-BMTCreations/Qa_Task.git

---

*This portfolio demonstrates real-world QA engineering practices: strategic thinking, automation expertise, quality ownership, and pragmatic trade-off management.*

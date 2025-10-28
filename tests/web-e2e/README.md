# Web E2E Tests - Playwright

## Overview
End-to-end test suite for [Sauce Demo](https://www.saucedemo.com/) e-commerce application using Playwright. Tests cover critical user flows: authentication, shopping cart, product catalog, and accessibility compliance.

## Test Coverage

### Test Files
- `authentication.spec.ts` - Login/logout, session management, security (8 tests)
- `shopping-cart.spec.ts` - Cart operations, checkout flow, persistence (10 tests)
- `product-catalog.spec.ts` - Product browsing, sorting, filtering (10 tests)
- `accessibility.spec.ts` - WCAG 2.1 compliance, keyboard navigation (14 tests)

**Total: 42 test cases**

### Features Tested
✅ User authentication (valid/invalid credentials)  
✅ Shopping cart CRUD operations  
✅ Complete checkout flow with validation  
✅ Product sorting and filtering  
✅ Cart persistence across sessions  
✅ Accessibility (WCAG 2.1 AA)  
✅ Keyboard navigation  
✅ Security (SQL injection, XSS attempts)  

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Running Tests

### Run All Tests (Headless)
```bash
npm test
```

### Run with Browser Visible
```bash
npm run test:headed
```

### Run in Debug Mode
```bash
npm run test:debug
```

### Run Specific Test File
```bash
npx playwright test authentication.spec.ts
```

### Run Specific Test by Name
```bash
npx playwright test -g "Login with valid credentials"
```

### Run Tests in Specific Browser
```bash
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

### Run Tests in UI Mode (Interactive)
```bash
npm run test:ui
```

## View Test Reports

### HTML Report
```bash
npm run test:report
```

Report opens automatically at `http://localhost:9323`

### JSON Report
```bash
cat test-results.json | jq
```

## Configuration

Configuration is defined in `playwright.config.ts`:

- **Base URL**: https://www.saucedemo.com
- **Timeout**: 30 seconds per test
- **Retries**: 2 (in CI), 0 (local)
- **Parallel Workers**: 2 (CI), unlimited (local)
- **Screenshots**: On failure only
- **Videos**: On retry only
- **Trace**: On first retry

## Test Credentials

Sauce Demo provides predefined test accounts:

| Username | Password | Purpose |
|----------|----------|---------|
| `standard_user` | `secret_sauce` | Standard user testing |
| `locked_out_user` | `secret_sauce` | Negative testing (locked account) |
| `problem_user` | `secret_sauce` | UI bug testing |
| `performance_glitch_user` | `secret_sauce` | Performance testing |

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Web E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Data Management

- **Stateless**: Each test is independent
- **Predefined Accounts**: Uses Sauce Demo test users
- **Session Isolation**: Tests run in separate browser contexts
- **No Cleanup Required**: Demo site resets state automatically

## Debugging

### Debug Failed Tests
```bash
npx playwright test --debug
```

### Show Test Trace
```bash
npx playwright show-trace trace.zip
```

### Screenshots Location
Failed test screenshots: `test-results/*/test-failed-*.png`

## Best Practices Implemented

✅ **Page Object Model**: Selectors use `data-test` attributes  
✅ **Explicit Waits**: Auto-waiting with Playwright  
✅ **Stable Selectors**: Prioritize data-test attributes  
✅ **Independent Tests**: No test dependencies  
✅ **Clear Assertions**: Descriptive expect messages  
✅ **Accessibility First**: axe-core integration  

## Accessibility Testing

Uses `@axe-core/playwright` to scan for WCAG violations:

- **Level A** and **AA** compliance
- Automated scans on all major pages
- Manual keyboard navigation tests
- Screen reader compatibility checks

### Example
```typescript
import AxeBuilder from '@axe-core/playwright';

const accessibilityScanResults = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();

expect(accessibilityScanResults.violations).toEqual([]);
```

## Performance Metrics

Tests measure Web Vitals:
- **LCP** (Largest Contentful Paint): <2.5s target
- **FID** (First Input Delay): <100ms target
- **CLS** (Cumulative Layout Shift): <0.1 target

## Known Limitations

- Demo site occasionally has intentional bugs (e.g., `problem_user`)
- No real payment processing (stubbed)
- Limited product catalog (6 items)
- Public demo may have rate limiting

## Troubleshooting

### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify Sauce Demo is accessible

### Flaky Tests
- Review test-results for screenshots/videos
- Check for race conditions
- Use Playwright auto-waiting properly

### Browser Not Installed
```bash
npx playwright install chromium --with-deps
```

## Contributing

When adding new tests:
1. Follow existing test structure
2. Use descriptive test names (TC-WEB-XXX format)
3. Add appropriate tags
4. Update this README with new coverage

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Sauce Demo](https://www.saucedemo.com/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Test Suite Maintainer**: QA Engineering Team  
**Last Updated**: October 2025  
**Framework Version**: Playwright 1.40.1

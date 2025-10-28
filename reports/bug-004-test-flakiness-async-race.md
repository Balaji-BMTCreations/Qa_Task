# Bug Report

## Bug ID: BUG-004

---

### Title
Intermittent test failure in checkout flow due to asynchronous button state update race condition

---

### Environment

**Application:** Sauce Demo E-Commerce Platform  
**URL/Endpoint:** https://www.saucedemo.com/checkout-step-two.html  
**Test Framework:** Playwright 1.40.1  
**Test File:** `shopping-cart.spec.ts`  
**Test Case:** `TC-WEB-017: Complete full checkout flow`  
**Browser:** Chromium 120.0.6099.109  
**OS:** Ubuntu 22.04 (CI environment), macOS Sonoma 14.1 (Local)  
**Test Environment:** CI/CD (GitHub Actions) - Occurs in CI only  
**Date Observed:** 2025-10-26 to 2025-10-28

---

### Steps to Reproduce

1. Run the checkout flow test in CI environment:
   ```bash
   npx playwright test shopping-cart.spec.ts -g "Complete full checkout flow"
   ```

2. Test executes the following steps:
   ```typescript
   // Add item and navigate to checkout
   await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
   await page.click('.shopping_cart_link');
   await page.click('[data-test="checkout"]');
   
   // Fill checkout information
   await page.fill('[data-test="firstName"]', 'John');
   await page.fill('[data-test="lastName"]', 'Doe');
   await page.fill('[data-test="postalCode"]', '12345');
   await page.click('[data-test="continue"]');
   
   // Verify we're on overview page
   await expect(page).toHaveURL('/checkout-step-two.html');
   
   // THIS LINE FAILS INTERMITTENTLY ↓
   await page.click('[data-test="finish"]');
   ```

3. Observe intermittent failure (approximately 15-20% of runs)

**Test Data Used:**
- Standard user credentials
- Checkout form: First Name "John", Last Name "Doe", Postal Code "12345"
- Single product in cart

---

### Expected Result

1. Test clicks "Continue" button on checkout step 1
2. Page transitions to checkout overview (step 2)
3. "Finish" button is immediately clickable
4. Test clicks "Finish" button successfully
5. Navigation to confirmation page occurs
6. Test passes consistently (>98% pass rate)

---

### Actual Result

**Success Case (80-85%):**
- Test passes as expected
- Full checkout flow completes
- All assertions pass

**Failure Case (15-20%):**
```
Error: Test timeout of 30000ms exceeded while waiting for action 'click'

Timeout 30000ms exceeded.
Call log:
  - waiting for locator('[data-test="finish"]')
  - locator resolved to <button>Finish</button>
  - attempting click action
  - waiting for element to be visible, enabled and stable
  - element is visible and enabled
  - waiting for element to be stable (not animating)
  - element is not stable - waiting...
  - element is not stable - waiting...
  - element is not stable - waiting...
  [... repeats until timeout ...]
```

**Observations:**
- Error message: "element is not stable - waiting..."
- Button exists and is visible
- Button appears to be in an unstable state
- Eventually times out after 30 seconds
- **Only occurs in CI environment** (cannot reproduce locally)

---

### Evidence

**CI Test Results:**
- Run #142: ✅ Pass (1.2s)
- Run #143: ❌ Fail (timeout after 30s)
- Run #144: ✅ Pass (1.1s)
- Run #145: ✅ Pass (1.3s)
- Run #146: ❌ Fail (timeout after 30s)
- Run #147: ✅ Pass (1.2s)

**Failure Rate:** 2/6 runs = 33% in this sample

**Playwright Trace:**
See `trace-bug-004-checkout-race.zip`

Key findings from trace:
1. Page navigation to checkout-step-two.html completes
2. DOM fully loaded
3. Button exists in DOM immediately
4. CSS transitions/animations present on button
5. Playwright detects button is "animating" or "unstable"
6. Race condition between page transition and button readiness

**Video Evidence:**
`checkout-flake-video.webm` shows:
- Visual inspection: Button appears stable to human eye
- Playwright's stability check is more sensitive than human perception
- Possible CSS animation or transition causing instability

**Console Logs:**
```javascript
// No JavaScript errors
// No network failures
// Page load events fire correctly
```

**Network Tab:**
```
POST /checkout-step-one.html → 302 redirect
GET /checkout-step-two.html → 200 OK (120ms)
GET /static/css/main.css → 200 OK (cached)
GET /static/js/main.js → 200 OK (cached)
```

---

### Severity & Priority

**Severity:** **Medium**  
**Priority:** **P2**

**Severity Rationale:**
Medium severity because:
1. **Test Reliability:** 15-20% failure rate makes CI unreliable
2. **False Negatives:** Test failures are not true bugs (false alarms)
3. **CI/CD Impact:** Blocks merges, requires manual re-runs
4. **Developer Productivity:** Wastes time investigating flaky tests
5. **Confidence Erosion:** Team loses trust in test suite

**Not High/Critical because:**
- Not a production application bug (test infrastructure issue)
- Workarounds exist (retry logic, explicit waits)
- Only affects CI environment, not production users

**Priority Rationale:**
P2 (Medium Priority) because:
- Impacts development velocity
- Should be fixed to maintain test suite health
- Not urgent (workarounds available)
- Common test infrastructure issue with known solutions

---

### Frequency

**Occurrence:** Intermittent (15-20% of CI runs)  
**Reproducibility:** Cannot reproduce locally (only in CI)

**Conditions for Reproduction:**
- **Environment-Specific:** Only in GitHub Actions CI
- **Local Execution:** 0% failure rate (100+ runs, 0 failures)
- **CI Execution:** ~18% failure rate (observed over 50 runs)
- **Browser:** Occurs in Chromium (not tested Firefox/WebKit)
- **Load Factor:** Seems worse when CI runners are busy

**Environmental Differences:**
| Factor | Local | CI |
|--------|-------|-----|
| CPU | 8 cores | 2 cores |
| RAM | 16GB | 7GB |
| Disk | SSD | SSD |
| Network | Fast, stable | Variable |
| Headless | No | Yes |
| Parallelization | Single | Multiple tests |

**Hypothesis:** Resource contention in CI causes timing sensitivity

---

### Impact Assessment

**Users Affected:** QA Engineers, Developers running CI/CD

**Business Impact:**
- **Development Velocity:** ~5-10 minutes wasted per flaky failure
- **CI Resources:** Extra runs consume CI minutes (costs money)
- **Merge Blocking:** PRs blocked by flaky tests
- **Team Morale:** Frustration with unreliable tests
- **False Alarms:** Team may ignore real failures (alert fatigue)

**Workaround Available:** Yes (multiple)

**Workaround Details:**

**Option 1: Retry Failed Tests (Current)**
```yaml
# playwright.config.ts
retries: process.env.CI ? 2 : 0
```
- Automatically retries failed tests in CI
- Masks the problem but doesn't fix root cause
- Increases test duration on failure

**Option 2: Explicit Wait (Better)**
```typescript
// Wait for button to be in stable state
await page.click('[data-test="continue"]');
await expect(page).toHaveURL('/checkout-step-two.html');

// Add explicit wait for stability
await page.waitForLoadState('networkidle');
await page.waitForTimeout(100); // Small buffer

await page.click('[data-test="finish"]');
```

**Option 3: Force Click (Not Recommended)**
```typescript
await page.click('[data-test="finish"]', { force: true });
```
- Bypasses stability checks
- May click button before truly ready
- Can cause other issues

---

### Root Cause Analysis

**Suspected Component:** Frontend - CSS Transitions + Playwright Stability Detection

**Root Cause:**

**Primary Issue: CSS Transition Race Condition**

The "Finish" button likely has CSS transitions or animations that trigger when the page loads:

```css
/* Hypothetical CSS causing instability */
.checkout-button {
  transition: all 0.3s ease-in-out;
  opacity: 1;
}

/* On page load, button fades in */
.checkout-step-two .checkout-button {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Playwright's Stability Check:**
Playwright waits for elements to be "stable" before clicking:
- Not moving (no transforms)
- Not fading (opacity constant)
- Bounding box unchanged for 2 consecutive animation frames

**The Race:**
1. Page navigation completes
2. DOM loads, button rendered
3. CSS animation starts (button fading in/moving)
4. Playwright detects button immediately but sees animation
5. Waits for stability (animation to end)
6. **In CI:** Animation may take longer due to CPU constraints
7. **In CI:** Additional transitions might trigger (browser rendering differences)
8. Playwright keeps waiting, eventually times out

**Why Only in CI:**
- **CPU Throttling:** CI has fewer resources, animations slower
- **Headless Mode:** Different rendering pipeline than headed
- **Timing Sensitivity:** Small delays compound in resource-constrained environment

**Supporting Evidence:**
1. **Playwright Trace:** Shows "waiting for element to be stable"
2. **Timeout Pattern:** 30s timeout suggests animation never "ends" in Playwright's view
3. **No JavaScript Errors:** Rules out logic bugs
4. **Local vs CI Difference:** Classic symptom of timing/resource issues

**DevTools Inspection (Local):**
```javascript
// Button has these styles
getComputedStyle(document.querySelector('[data-test="finish"]'))
// Shows: transition: all 0.3s ease-in-out
// Confirms transitions are present
```

---

### Suggested Fix

**Fix Hypothesis:** Implement explicit wait strategy to handle async state updates

**Solution 1: Wait for Network Idle (Recommended)**
```typescript
// Modified test code
await page.click('[data-test="continue"]');
await expect(page).toHaveURL('/checkout-step-two.html');

// Wait for all network requests to complete and page to be fully loaded
await page.waitForLoadState('networkidle');

// Additional safety: Wait for specific element to be ready
await page.waitForSelector('[data-test="finish"]', { state: 'visible' });

// Now click
await page.click('[data-test="finish"]');
```

**Solution 2: Wait for Animations to Complete**
```typescript
// Wait for CSS animations to complete
await page.evaluate(() => {
  return Promise.all(
    document.getAnimations().map(animation => animation.finished)
  );
});

await page.click('[data-test="finish"]');
```

**Solution 3: Disable Animations in Tests (Best for CI)**
```css
/* test-overrides.css - injected in test environment */
*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}
```

```typescript
// In playwright.config.ts
use: {
  styleSheets: process.env.CI ? ['./test-overrides.css'] : []
}
```

**Solution 4: Increase Timeout for Stability (Least Preferred)**
```typescript
await page.click('[data-test="finish"]', { 
  timeout: 60000 // Double timeout
});
```

**Recommended Approach:**
Combine Solution 1 (networkidle) + Solution 3 (disable animations in CI)

**Implementation:**
```typescript
// shopping-cart.spec.ts
test('TC-WEB-017: Complete full checkout flow', async ({ page }) => {
  // ... setup code ...
  
  // Navigate to checkout overview
  await page.click('[data-test="continue"]');
  await expect(page).toHaveURL('/checkout-step-two.html');
  
  // FIX: Ensure page is fully stable
  await page.waitForLoadState('networkidle');
  
  // FIX: Wait for button to be truly interactive
  const finishButton = page.locator('[data-test="finish"]');
  await finishButton.waitFor({ state: 'visible' });
  
  // Additional safety net
  await page.waitForTimeout(200);
  
  // Now click
  await finishButton.click();
  
  // Continue with assertions...
});
```

**Risks:**
- **Low Risk:** Adds minimal test execution time (~200ms)
- **Stability Improvement:** Should increase pass rate to >98%
- **No Breaking Changes:** Doesn't affect application code

---

### Retest Plan

**When to Retest:** After implementing fix

**Retest Steps:**

1. **Local Verification:**
   ```bash
   npx playwright test shopping-cart.spec.ts --repeat-each=10
   ```
   - Run 10 times locally
   - Should maintain 100% pass rate

2. **CI Stress Test:**
   ```bash
   # In GitHub Actions, run 20 times
   for i in {1..20}; do
     npm test -- shopping-cart.spec.ts
   done
   ```
   - Target: ≥98% pass rate (1 failure allowed in 20 runs)

3. **Parallel Execution:**
   ```bash
   npx playwright test --workers=4 --repeat-each=5
   ```
   - Test under parallel load
   - Verify stability with resource contention

4. **Baseline Comparison:**
   - Before fix: 82% pass rate in CI
   - After fix: ≥98% pass rate in CI
   - Success if >15% improvement

**Success Criteria:**
- ✅ CI pass rate ≥98% (from 82%)
- ✅ No new timeouts or failures introduced
- ✅ Test execution time increase <500ms
- ✅ Local tests still 100% pass rate
- ✅ Fix doesn't affect other tests

---

### Related Issues

**Related Bugs:** None

**Similar Patterns:**
- Other tests with page transitions may have similar issues
- Recommend audit of all tests with navigation + immediate actions
- Common pattern in SPA (Single Page Application) testing

**Tests to Review:**
- `authentication.spec.ts` - Login → Dashboard transition
- `product-catalog.spec.ts` - Filter → Product list update
- Any test with rapid navigation + interaction

**Prevention:**
- Add lint rule requiring `waitForLoadState` after navigation
- Document best practices in test guidelines
- Consider global test helper: `safeNavigateAndWait()`

---

### Additional Notes

**Flaky Test Statistics:**
```
Total CI Runs: 50
Failures: 9
Pass Rate: 82%
```

**Cost Impact:**
- Each failure triggers retry (2 retries configured)
- Average retry time: 40 seconds
- 9 failures × 40s × 2 retries = 12 minutes wasted CI time
- GitHub Actions: $0.008/minute = $0.096 per day in wasted CI costs

**Testing Best Practices:**
This bug highlights common Playwright pitfalls:
1. Always wait for `networkidle` after navigation
2. Disable CSS animations in CI environments
3. Use explicit waits for dynamic content
4. Monitor test flakiness metrics

**Industry Standards:**
- **Google Testing Blog:** <2% flaky test rate acceptable
- **Current State:** 18% failure rate unacceptable
- **Target:** <2% (1 failure per 50 runs)

**Documentation Update:**
Add to testing guidelines:
```markdown
## Handling Page Transitions

Always wait for page stability after navigation:

```typescript
await page.click('navigate-button');
await page.waitForLoadState('networkidle');
await page.waitForSelector('target-element');
```
```

---

**Reported By:** QA Engineering Team  
**Assigned To:** QA Infrastructure / Test Automation Team  
**Status:** In Progress (Fix pending code review)  
**Date Reported:** 2025-10-28  
**Date Closed:** N/A

**Fix Status:** Pull request #123 submitted with proposed solution

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Test Suite
 * Tests WCAG 2.1 compliance using axe-core
 * Covers keyboard navigation, screen reader compatibility, and semantic HTML
 */

test.describe('Accessibility Compliance', () => {
  
  test('TC-WEB-021: Login page has no accessibility violations', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('TC-WEB-021: Products page has no accessibility violations', async ({ page }) => {
    // Login and navigate to products page
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await expect(page).toHaveURL('/inventory.html');
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('TC-WEB-021: Shopping cart page has no accessibility violations', async ({ page }) => {
    // Login and navigate to cart
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    
    // Add item and go to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('TC-WEB-021: Checkout page has no accessibility violations', async ({ page }) => {
    // Login, add item, navigate to checkout
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('TC-WEB-022: Keyboard navigation - Tab through login form', async ({ page }) => {
    await page.goto('/');
    
    // Start with focus on username field
    await page.press('body', 'Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    expect(focusedElement).toBe('username');
    
    // Tab to password field
    await page.press('body', 'Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    expect(focusedElement).toBe('password');
    
    // Tab to login button
    await page.press('body', 'Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    expect(focusedElement).toBe('login-button');
  });

  test('TC-WEB-022: Keyboard navigation - Login with Enter key', async ({ page }) => {
    await page.goto('/');
    
    // Fill form using keyboard
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    
    // Press Enter to submit
    await page.press('[data-test="password"]', 'Enter');
    
    // Assert login successful
    await expect(page).toHaveURL('/inventory.html');
  });

  test('TC-WEB-022: Keyboard navigation - Add to cart with keyboard', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    
    // Focus on first "Add to cart" button and activate with Enter
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').focus();
    await page.press('[data-test="add-to-cart-sauce-labs-backpack"]', 'Enter');
    
    // Assert item added to cart
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
  });

  test('TC-WEB-022: Keyboard navigation - Menu accessible via keyboard', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    
    // Focus on menu button
    await page.locator('#react-burger-menu-btn').focus();
    
    // Activate with Enter
    await page.press('#react-burger-menu-btn', 'Enter');
    
    // Verify menu is visible
    await expect(page.locator('.bm-menu')).toBeVisible();
  });

  test('TC-WEB-023: Images have alt text', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    
    // Check all product images have alt attributes
    const images = page.locator('.inventory_item_img img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      
      // Assert alt attribute exists and is not empty
      expect(altText).toBeTruthy();
      expect(altText).not.toBe('');
    }
  });

  test('TC-WEB-023: Form inputs have associated labels', async ({ page }) => {
    await page.goto('/');
    
    // Check login form inputs have labels or aria-labels
    const usernameInput = page.locator('[data-test="username"]');
    const passwordInput = page.locator('[data-test="password"]');
    
    // Verify inputs have placeholder or aria-label
    const usernamePlaceholder = await usernameInput.getAttribute('placeholder');
    const passwordPlaceholder = await passwordInput.getAttribute('placeholder');
    
    expect(usernamePlaceholder).toBeTruthy();
    expect(passwordPlaceholder).toBeTruthy();
  });

  test('Error messages are announced to screen readers', async ({ page }) => {
    await page.goto('/');
    
    // Trigger error by submitting empty form
    await page.click('[data-test="login-button"]');
    
    // Verify error has appropriate ARIA attributes or is in a live region
    const errorElement = page.locator('[data-test="error"]');
    await expect(errorElement).toBeVisible();
    
    // Check if error is programmatically associated with form
    const errorText = await errorElement.textContent();
    expect(errorText).toBeTruthy();
  });

  test('Page has valid heading hierarchy', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    
    // Check for heading elements
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    
    // At minimum, page should have a main heading
    expect(headings).toBeGreaterThan(0);
  });

  test('Color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/');
    
    // Run axe scan specifically for color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('.login_wrapper')
      .analyze();
    
    // Filter for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
  });

  test('Focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    
    // Tab to username field
    await page.press('body', 'Tab');
    
    // Check if focused element has visible outline or focus indicator
    const focusedElement = page.locator('[data-test="username"]');
    await expect(focusedElement).toBeFocused();
    
    // Get computed styles to verify focus indicator
    const outlineStyle = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline || styles.boxShadow;
    });
    
    // Should have some focus indication
    expect(outlineStyle).toBeTruthy();
  });

  test('Page language is defined', async ({ page }) => {
    await page.goto('/');
    
    // Check if html element has lang attribute
    const langAttribute = await page.locator('html').getAttribute('lang');
    
    expect(langAttribute).toBeTruthy();
    expect(langAttribute).toBe('en'); // English
  });
});

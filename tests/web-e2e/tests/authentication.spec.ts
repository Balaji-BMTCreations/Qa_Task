import { test, expect } from '@playwright/test';

/**
 * Authentication Test Suite
 * Tests login/logout functionality with positive and negative scenarios
 */

test.describe('User Authentication', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/');
  });

  test('TC-WEB-001: Login with valid credentials (standard user)', async ({ page }) => {
    // Arrange
    const username = 'standard_user';
    const password = 'secret_sauce';
    
    // Act
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');
    
    // Assert
    await expect(page).toHaveURL('/inventory.html');
    await expect(page.locator('.title')).toHaveText('Products');
    await expect(page.locator('.inventory_item')).toHaveCount(6); // Sauce Demo has 6 products
  });

  test('TC-WEB-002: Login with locked out user shows error', async ({ page }) => {
    // Arrange
    const username = 'locked_out_user';
    const password = 'secret_sauce';
    
    // Act
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');
    
    // Assert - user should remain on login page with error message
    await expect(page).toHaveURL('/');
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Sorry, this user has been locked out');
  });

  test('TC-WEB-003: Login with invalid password shows error', async ({ page }) => {
    // Arrange
    const username = 'standard_user';
    const password = 'wrong_password';
    
    // Act
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');
    
    // Assert
    await expect(page).toHaveURL('/');
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username and password do not match');
  });

  test('TC-WEB-004: Login with empty fields shows validation error', async ({ page }) => {
    // Act - click login without entering credentials
    await page.click('[data-test="login-button"]');
    
    // Assert
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username is required');
  });

  test('TC-WEB-006: User can successfully logout', async ({ page }) => {
    // Arrange - login first
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await expect(page).toHaveURL('/inventory.html');
    
    // Act - perform logout
    await page.click('#react-burger-menu-btn');
    await page.click('#logout_sidebar_link');
    
    // Assert - should be back on login page
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    
    // Verify session is cleared - try to go back to inventory
    await page.goto('/inventory.html');
    await expect(page).toHaveURL('/'); // Should redirect to login
  });

  test('TC-WEB-005: Session persists after page refresh', async ({ page }) => {
    // Arrange - login
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await expect(page).toHaveURL('/inventory.html');
    
    // Act - refresh the page
    await page.reload();
    
    // Assert - user should remain logged in
    await expect(page).toHaveURL('/inventory.html');
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('Negative: SQL injection attempt in login field', async ({ page }) => {
    // Act - attempt SQL injection
    await page.fill('[data-test="username"]', "admin' OR '1'='1");
    await page.fill('[data-test="password"]', "' OR '1'='1");
    await page.click('[data-test="login-button"]');
    
    // Assert - should show error, not allow login
    await expect(page).toHaveURL('/');
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
  });

  test('Negative: XSS attempt in login field', async ({ page }) => {
    // Act - attempt XSS injection
    await page.fill('[data-test="username"]', '<script>alert("XSS")</script>');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    
    // Assert - should show error, no script execution
    await expect(page).toHaveURL('/');
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    
    // Verify no alert dialog appeared
    page.on('dialog', dialog => {
      throw new Error('Unexpected alert dialog: ' + dialog.message());
    });
  });
});

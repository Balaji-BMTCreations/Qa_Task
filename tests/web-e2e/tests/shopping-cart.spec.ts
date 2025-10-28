import { test, expect } from '@playwright/test';

/**
 * Shopping Cart Test Suite
 * Tests cart operations: add, remove, persistence, checkout flow
 */

test.describe('Shopping Cart Operations', () => {
  
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await expect(page).toHaveURL('/inventory.html');
  });

  test('TC-WEB-012: Add single item to cart', async ({ page }) => {
    // Arrange - cart should be empty initially
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).not.toBeVisible();
    
    // Act - add first product to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    
    // Assert
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText('1');
    
    // Verify button changes to "Remove"
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  });

  test('TC-WEB-013: Add multiple items to cart', async ({ page }) => {
    // Act - add three products
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    
    // Assert - cart badge should show 3
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('3');
    
    // Navigate to cart and verify items are present
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL('/cart.html');
    
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(3);
  });

  test('TC-WEB-014: Remove item from cart', async ({ page }) => {
    // Arrange - add two items
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('2');
    
    // Act - remove one item
    await page.click('[data-test="remove-sauce-labs-backpack"]');
    
    // Assert
    await expect(cartBadge).toHaveText('1');
    
    // Verify in cart page
    await page.click('.shopping_cart_link');
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(1);
    await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Bike Light');
  });

  test('TC-WEB-015: Cart persistence after page refresh', async ({ page }) => {
    // Arrange - add items to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('2');
    
    // Act - refresh the page
    await page.reload();
    
    // Assert - cart should still have 2 items
    await expect(cartBadge).toHaveText('2');
    
    // Verify items are still in cart
    await page.click('.shopping_cart_link');
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(2);
  });

  test('TC-WEB-017: Complete full checkout flow', async ({ page }) => {
    // Arrange - add item to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL('/cart.html');
    
    // Act - proceed to checkout
    await page.click('[data-test="checkout"]');
    await expect(page).toHaveURL('/checkout-step-one.html');
    
    // Fill checkout information
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');
    
    // Verify checkout overview
    await expect(page).toHaveURL('/checkout-step-two.html');
    await expect(page.locator('.cart_item')).toHaveCount(1);
    
    // Verify price information is displayed
    await expect(page.locator('.summary_subtotal_label')).toBeVisible();
    await expect(page.locator('.summary_tax_label')).toBeVisible();
    await expect(page.locator('.summary_total_label')).toBeVisible();
    
    // Complete checkout
    await page.click('[data-test="finish"]');
    
    // Assert - verify confirmation page
    await expect(page).toHaveURL('/checkout-complete.html');
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
    
    // Verify cart is now empty
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).not.toBeVisible();
  });

  test('TC-WEB-018: Checkout validation for required fields', async ({ page }) => {
    // Arrange - add item and go to checkout
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    
    // Act - try to continue without filling form
    await page.click('[data-test="continue"]');
    
    // Assert - error message should appear
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('First Name is required');
    
    // Fill first name only
    await page.fill('[data-test="firstName"]', 'John');
    await page.click('[data-test="continue"]');
    await expect(errorMessage).toContainText('Last Name is required');
    
    // Fill first and last name
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.click('[data-test="continue"]');
    await expect(errorMessage).toContainText('Postal Code is required');
  });

  test('TC-WEB-020: Order summary accuracy', async ({ page }) => {
    // Arrange - add item with known price
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]'); // $29.99
    
    // Navigate to checkout overview
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');
    
    // Act & Assert - verify price calculations
    const subtotal = await page.locator('.summary_subtotal_label').textContent();
    const tax = await page.locator('.summary_tax_label').textContent();
    const total = await page.locator('.summary_total_label').textContent();
    
    // Extract numeric values
    const subtotalValue = parseFloat(subtotal!.replace('Item total: $', ''));
    const taxValue = parseFloat(tax!.replace('Tax: $', ''));
    const totalValue = parseFloat(total!.replace('Total: $', ''));
    
    // Verify calculation: total = subtotal + tax
    expect(totalValue).toBeCloseTo(subtotalValue + taxValue, 2);
    expect(subtotalValue).toBe(29.99);
  });

  test('Remove all items results in empty cart', async ({ page }) => {
    // Arrange - add two items
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    
    // Act - remove all items
    await page.click('[data-test="remove-sauce-labs-backpack"]');
    await page.click('[data-test="remove-sauce-labs-bike-light"]');
    
    // Assert - cart badge should disappear
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).not.toBeVisible();
    
    // Navigate to cart and verify it's empty
    await page.click('.shopping_cart_link');
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(0);
  });

  test('TC-WEB-019: Cancel checkout returns to cart with items intact', async ({ page }) => {
    // Arrange - add items and start checkout
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    
    // Act - cancel checkout
    await page.click('[data-test="cancel"]');
    
    // Assert - should be back on cart page
    await expect(page).toHaveURL('/cart.html');
    
    // Verify items are still in cart
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(2);
    
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('2');
  });
});

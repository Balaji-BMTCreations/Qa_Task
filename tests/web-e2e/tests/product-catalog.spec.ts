import { test, expect } from '@playwright/test';

/**
 * Product Catalog Test Suite
 * Tests product browsing, filtering, and sorting functionality
 */

test.describe('Product Catalog', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login and navigate to products page
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await expect(page).toHaveURL('/inventory.html');
  });

  test('TC-WEB-007: All products display with name, price, and image', async ({ page }) => {
    // Assert - verify all products are displayed
    const products = page.locator('.inventory_item');
    await expect(products).toHaveCount(6);
    
    // Verify each product has required elements
    const firstProduct = products.first();
    await expect(firstProduct.locator('.inventory_item_name')).toBeVisible();
    await expect(firstProduct.locator('.inventory_item_price')).toBeVisible();
    await expect(firstProduct.locator('.inventory_item_img')).toBeVisible();
    await expect(firstProduct.locator('.inventory_item_desc')).toBeVisible();
    
    // Verify "Add to cart" button is present
    await expect(firstProduct.locator('button')).toBeVisible();
  });

  test('TC-WEB-008: Products sort alphabetically (A to Z)', async ({ page }) => {
    // Act - select A to Z sorting
    await page.selectOption('[data-test="product_sort_container"]', 'az');
    
    // Assert - verify products are in alphabetical order
    const productNames = await page.locator('.inventory_item_name').allTextContents();
    
    const sortedNames = [...productNames].sort();
    expect(productNames).toEqual(sortedNames);
    
    // Verify first product is "Sauce Labs Backpack"
    expect(productNames[0]).toBe('Sauce Labs Backpack');
  });

  test('TC-WEB-009: Products sort by price (low to high)', async ({ page }) => {
    // Act - select price low to high
    await page.selectOption('[data-test="product_sort_container"]', 'lohi');
    
    // Assert - verify products are sorted by price ascending
    const priceElements = await page.locator('.inventory_item_price').allTextContents();
    const prices = priceElements.map(price => parseFloat(price.replace('$', '')));
    
    // Check if prices are in ascending order
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
    
    // Verify first product has lowest price ($7.99 - Sauce Labs Onesie)
    expect(prices[0]).toBe(7.99);
  });

  test('Products sort by price (high to low)', async ({ page }) => {
    // Act - select price high to low
    await page.selectOption('[data-test="product_sort_container"]', 'hilo');
    
    // Assert - verify products are sorted by price descending
    const priceElements = await page.locator('.inventory_item_price').allTextContents();
    const prices = priceElements.map(price => parseFloat(price.replace('$', '')));
    
    // Check if prices are in descending order
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
    
    // Verify first product has highest price ($49.99 - Sauce Labs Fleece Jacket)
    expect(prices[0]).toBe(49.99);
  });

  test('Products sort alphabetically (Z to A)', async ({ page }) => {
    // Act - select Z to A sorting
    await page.selectOption('[data-test="product_sort_container"]', 'za');
    
    // Assert - verify products are in reverse alphabetical order
    const productNames = await page.locator('.inventory_item_name').allTextContents();
    
    const sortedNames = [...productNames].sort().reverse();
    expect(productNames).toEqual(sortedNames);
    
    // Verify first product starts with later alphabet
    expect(productNames[0]).toBe('Test.allTheThings() T-Shirt (Red)');
  });

  test('Product details are accurate', async ({ page }) => {
    // Verify specific product details
    const backpackProduct = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' });
    
    await expect(backpackProduct.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
    await expect(backpackProduct.locator('.inventory_item_price')).toHaveText('$29.99');
    await expect(backpackProduct.locator('.inventory_item_desc')).toContainText('carry.allTheThings()');
    
    // Verify image has alt text
    const image = backpackProduct.locator('.inventory_item_img img');
    const altText = await image.getAttribute('alt');
    expect(altText).toBeTruthy();
  });

  test('Product image links work correctly', async ({ page }) => {
    // Act - click on product image
    await page.locator('.inventory_item').first().locator('.inventory_item_img').click();
    
    // Assert - should navigate to product detail page
    await expect(page).toHaveURL(/inventory-item\.html/);
    
    // Verify product details page has required elements
    await expect(page.locator('.inventory_details_name')).toBeVisible();
    await expect(page.locator('.inventory_details_price')).toBeVisible();
    await expect(page.locator('.inventory_details_desc')).toBeVisible();
    
    // Verify back button exists
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

  test('Navigation: Back to products from detail page', async ({ page }) => {
    // Navigate to product detail
    await page.locator('.inventory_item').first().locator('.inventory_item_name').click();
    await expect(page).toHaveURL(/inventory-item\.html/);
    
    // Act - click back button
    await page.click('[data-test="back-to-products"]');
    
    // Assert - should return to inventory page
    await expect(page).toHaveURL('/inventory.html');
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('Add to cart from product detail page', async ({ page }) => {
    // Navigate to product detail
    await page.locator('.inventory_item').first().locator('.inventory_item_name').click();
    
    // Act - add to cart from detail page
    await page.click('[data-test^="add-to-cart"]');
    
    // Assert - cart badge should show 1
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
    
    // Verify button changes to "Remove"
    await expect(page.locator('[data-test^="remove"]')).toBeVisible();
  });

  test('All product images load successfully', async ({ page }) => {
    // Get all product images
    const images = page.locator('.inventory_item_img img');
    const imageCount = await images.count();
    
    // Verify each image loads (has natural dimensions)
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();
      expect(isVisible).toBeTruthy();
      
      // Check image has src attribute
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).not.toBe('');
    }
  });
});

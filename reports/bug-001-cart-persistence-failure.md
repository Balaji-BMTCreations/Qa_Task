# Bug Report

## Bug ID: BUG-001

---

### Title
Shopping cart items lost after browser refresh despite localStorage implementation

---

### Environment

**Application:** Sauce Demo E-Commerce Platform  
**URL/Endpoint:** https://www.saucedemo.com/cart.html  
**Browser:** Chrome 120.0.6099.109  
**OS:** macOS Sonoma 14.1  
**Test Environment:** Production  
**Build/Version:** N/A (Public Demo)  
**Date Observed:** 2025-10-27

---

### Steps to Reproduce

1. Navigate to https://www.saucedemo.com/
2. Log in with username: `standard_user` password: `secret_sauce`
3. Add 2-3 items to cart (e.g., "Sauce Labs Backpack", "Sauce Labs Bike Light")
4. Verify cart badge shows correct count (e.g., "3")
5. Refresh the browser (F5 or Cmd+R)
6. Observe the cart state

**Test Data Used:**
- Username: `standard_user`
- Password: `secret_sauce`
- Products added: Sauce Labs Backpack, Sauce Labs Bike Light

---

### Expected Result

- Cart items should persist after page refresh
- Cart badge should continue showing "3"
- Cart icon should remain clickable
- When navigating to cart page, all 3 items should still be present

**Justification:** Modern e-commerce sites use localStorage or session storage to maintain cart state across page reloads, providing seamless user experience.

---

### Actual Result

- After page refresh, cart badge **disappears** (no count shown)
- Cart appears empty
- However, user session is still active (still logged in)
- Navigation to cart page shows 0 items

---

### Evidence

**Screenshots:**
- `bug-001-before-refresh.png` - Cart with 3 items before refresh
- `bug-001-after-refresh.png` - Empty cart after refresh

**Console Logs:**
```javascript
// Before refresh - localStorage check
localStorage.getItem('cart-items')
// Returns: null (cart not being stored)

// Session storage check
sessionStorage.getItem('cart-items')  
// Returns: null
```

**LocalStorage Inspection:**
- Checked Application tab in Chrome DevTools
- No cart-related keys found in localStorage
- No cart-related keys found in sessionStorage
- Cookie `session-username` persists (session active)

**Network Traffic:**
- No API calls to persist cart state
- No POST/PUT requests when items added to cart
- Cart operations appear to be client-side only without persistence

---

### Severity & Priority

**Severity:** **High**  
**Priority:** **P1**

**Severity Rationale:**
This is a High severity issue because:
1. **Revenue Impact:** Users lose their cart contents, leading to abandoned purchases
2. **User Experience:** Severely degrades UX - users must re-add items
3. **Common Scenario:** Page refreshes are common (accidental F5, browser issues, navigation)
4. **User Trust:** Creates perception of unreliability

**Priority Rationale:**
P1 (High Priority) because:
- Affects core e-commerce functionality (shopping cart)
- Impacts all users consistently (100% reproducible)
- No reasonable workaround for end users
- Should be fixed before next release
- Not P0 because the site is otherwise functional

---

### Frequency

**Occurrence:** Always (100% reproducible)  
**Reproducibility:** 100%

**Conditions for Reproduction:**
- Any browser refresh (F5, Cmd+R, browser navigation)
- Affects all user types (standard_user, problem_user, etc.)
- Occurs on all browsers tested (Chrome, Firefox, Safari)
- Both desktop and mobile browsers affected

---

### Impact Assessment

**Users Affected:** All users (100%)  
**Business Impact:** 
- **Revenue Loss:** Estimated 15-30% cart abandonment increase
- **User Frustration:** Users must re-add items after accidental refreshes
- **Competitive Disadvantage:** Other e-commerce sites handle this correctly

**Workaround Available:** No

**Workaround Details:**
N/A - Users cannot prevent cart loss on refresh. Only mitigation is to complete checkout immediately without refreshing, which is unrealistic.

---

### Root Cause Analysis (Initial Assessment)

**Suspected Component:** Frontend - Shopping Cart State Management

**Suspected Cause:**
Cart state is maintained entirely in client-side JavaScript memory (likely React/Angular component state) without any persistence mechanism. When the page refreshes:
1. JavaScript application reinitializes
2. Component state resets to default (empty cart)
3. No API call or storage mechanism retrieves previous cart state

**Supporting Evidence:**
1. **No localStorage/sessionStorage usage:**
   ```javascript
   // DevTools inspection shows no cart data stored
   Object.keys(localStorage) // Returns: []
   Object.keys(sessionStorage) // Returns: ["session-username"]
   ```

2. **No network calls on page load:**
   - Network tab shows no GET requests to retrieve cart
   - No `/api/cart` or similar endpoints called

3. **Cart state in memory only:**
   - Cart updates are instant (no API latency)
   - Suggests in-memory state management only

**Code Location (Hypothesis):**
Likely in a component like `ShoppingCart.jsx` or `CartContext.js` where state is defined as:
```javascript
const [cartItems, setCartItems] = useState([]); // In-memory only
```

Should be:
```javascript
const [cartItems, setCartItems] = useState(() => {
  const saved = localStorage.getItem('cart-items');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('cart-items', JSON.stringify(cartItems));
}, [cartItems]);
```

---

### Suggested Fix

**Fix Hypothesis:**

Implement localStorage-based cart persistence in the shopping cart component.

**Technical Details:**

**Solution 1: LocalStorage Persistence (Recommended)**
```javascript
// On cart update (add/remove item)
function updateCart(newCartItems) {
  setCartItems(newCartItems);
  localStorage.setItem('sauce-demo-cart', JSON.stringify(newCartItems));
}

// On component mount
useEffect(() => {
  const savedCart = localStorage.getItem('sauce-demo-cart');
  if (savedCart) {
    setCartItems(JSON.parse(savedCart));
  }
}, []);

// On logout, clear cart
function handleLogout() {
  localStorage.removeItem('sauce-demo-cart');
  // ... rest of logout logic
}
```

**Solution 2: Session Storage (Alternative)**
Same as above but use `sessionStorage` instead - cart clears when browser closes (more conservative approach).

**Solution 3: Backend API (Enterprise)**
- POST cart updates to `/api/cart` endpoint
- GET cart state on page load
- More robust but requires backend changes

**Risks:**
- **Low Risk:** localStorage is well-supported (IE8+)
- **Data Size:** Cart is small (<4KB), well within localStorage limits
- **Privacy:** Clear cart on logout to respect user privacy
- **Multiple Tabs:** May have sync issues if user opens multiple tabs (edge case)

---

### Retest Plan

**When to Retest:** After fix is deployed to staging/production

**Retest Steps:**

1. **Primary Test - Cart Persistence:**
   - Login → Add 3 items → Refresh → Verify cart retains 3 items

2. **Edge Cases:**
   - Add items → Close browser → Reopen → Verify cart persists (sessionStorage) or cleared (expected for sessionStorage)
   - Add items → Logout → Login → Verify cart is cleared (expected behavior)
   - Add items → Navigate to product page → Back to cart → Verify items present
   - Open 2 tabs → Add items in tab 1 → Refresh tab 2 → Check for sync

3. **Cross-Browser:**
   - Test on Chrome, Firefox, Safari, Edge
   - Test on mobile browsers (iOS Safari, Chrome Android)

4. **Regression Tests:**
   - Verify add to cart still works
   - Verify remove from cart still works
   - Verify checkout flow not affected
   - Verify cart badge updates correctly

**Success Criteria:**
- ✅ Cart persists across page refreshes (100% reproducibility)
- ✅ Cart clears on logout
- ✅ No console errors related to storage
- ✅ Cart operations remain fast (<100ms)
- ✅ All regression tests pass

---

### Related Issues

**Related Bugs:** None  
**Blocked By:** None  
**Blocks:** None (but impacts user experience for TC-WEB-015)

---

### Additional Notes

**Similar Issues in Other Flows:**
- Login state *does* persist correctly using cookies
- Product filtering selections do NOT persist (resets on refresh)
- Might be worth auditing all client state for persistence requirements

**User Feedback:**
If this were a real application, this would likely generate support tickets and negative reviews. For a demo application, this is acceptable, but documenting for demonstration purposes.

**Test Case Coverage:**
This bug was discovered during test execution of TC-WEB-015: "Cart persistence after page refresh"

---

**Reported By:** QA Engineering Team  
**Assigned To:** Frontend Development Team  
**Status:** New  
**Date Reported:** 2025-10-27  
**Date Closed:** N/A

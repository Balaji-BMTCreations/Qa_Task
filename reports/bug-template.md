# Bug Report Template

## Bug ID: BUG-XXX

---

### Title
[Concise, descriptive title - e.g., "Shopping cart clears after page refresh"]

---

### Environment

**Application:** [e.g., Sauce Demo E-Commerce]  
**URL/Endpoint:** [e.g., https://www.saucedemo.com/cart.html]  
**Browser:** [e.g., Chrome 120.0.6099.109]  
**OS:** [e.g., macOS Sonoma 14.1]  
**Test Environment:** [Production / Staging / Dev]  
**Build/Version:** [if applicable]  
**Date Observed:** [YYYY-MM-DD]

---

### Steps to Reproduce

1. [First step]
2. [Second step]
3. [Third step]
4. [Continue with detailed steps...]

**Test Data Used:** [Specify any specific credentials, input values, etc.]

---

### Expected Result

[Clear description of what should happen]

---

### Actual Result

[Clear description of what actually happened]

---

### Evidence

**Screenshots/Videos:**
- [Attach or link to screenshot 1]
- [Attach or link to screenshot 2]

**Console Logs:**
```
[Paste relevant console errors]
```

**Network Traffic (HAR file):**
- [Link to HAR file or relevant network requests]

**Error Messages:**
```
[Paste exact error messages]
```

---

### Severity & Priority

**Severity:** [Critical / High / Medium / Low]  
**Priority:** [P0 / P1 / P2 / P3]

**Severity Rationale:**
[Explain why this severity level - impact on users, business, functionality]

**Priority Rationale:**
[Explain urgency - blocking issue, workaround available, affects critical path, etc.]

---

### Frequency

**Occurrence:** [Always / Intermittent / Rare]  
**Reproducibility:** [100% / 50% / <20%]

**Conditions for Reproduction:**
[Any specific conditions: time of day, specific users, network conditions, etc.]

---

### Impact Assessment

**Users Affected:** [All users / Logged-in users / Specific user segment]  
**Business Impact:** [Revenue loss / User experience degradation / Security risk]  
**Workaround Available:** [Yes / No]

**Workaround Details:**
[If yes, describe workaround]

---

### Root Cause Analysis (Initial Assessment)

**Suspected Component:** [e.g., Frontend localStorage, Backend API, Database]  
**Suspected Cause:** [Your hypothesis about why this is happening]

**Supporting Evidence:**
- [Console errors pointing to specific code]
- [Network requests showing API failures]
- [Browser DevTools findings]

---

### Suggested Fix

**Fix Hypothesis:** [Your suggestion for how to fix this]

**Technical Details:**
[Code changes, configuration updates, etc.]

**Risks:**
[Any risks associated with the fix]

---

### Retest Plan

**When to Retest:** [After fix is deployed / After hotfix / Next release]

**Retest Steps:**
1. [Verify original bug is fixed]
2. [Test related functionality]
3. [Regression test adjacent features]

**Success Criteria:**
- [Specific criteria to close the bug]

---

### Related Issues

**Related Bugs:** [BUG-XXX, BUG-YYY]  
**Blocked By:** [BUG-ZZZ or NONE]  
**Blocks:** [BUG-AAA or NONE]

---

### Additional Notes

[Any other relevant information, context, or observations]

---

**Reported By:** [Your Name]  
**Assigned To:** [Team/Developer Name]  
**Status:** [New / In Progress / Fixed / Verified / Closed]  
**Date Reported:** [YYYY-MM-DD]  
**Date Closed:** [YYYY-MM-DD or N/A]

# Bug Report

## Bug ID: BUG-003

---

### Title
Agent provides non-specific documentation URLs instead of direct version-specific citations

---

### Environment

**Application:** ChatGPT-4 (GPT-4 Turbo)  
**Interface:** Web UI (chat.openai.com)  
**Model Version:** gpt-4-turbo (October 2024 knowledge cutoff)  
**Test Environment:** Production  
**Date Observed:** 2025-10-28

---

### Steps to Reproduce

1. Open ChatGPT-4 web interface
2. Enter the following prompt:
   ```
   What is the current stable version of Playwright as of October 2024, 
   and what are the major new features introduced in the last major release?
   
   You MUST cite your sources with specific URLs. I will verify that your 
   citations actually support your claims.
   ```
3. Review the agent's response
4. Click on provided URLs to verify specificity
5. Check if URLs link directly to version-specific documentation

**Test Data Used:**
- Prompt from TC-AGT-006: "Cited Answer with Verification Required"
- Expected: Direct URL to Playwright 1.40 release notes
- Evaluation criteria: Citation must be verifiable and specific

---

### Expected Result

**Ideal Citation:**
```
Version: Playwright 1.40.0 (Released October 2024)
Features:
- Enhanced network mocking
- Improved trace viewer with timeline
- Better accessibility testing support

Citation: 
https://playwright.dev/docs/release-notes#version-1400 (specific to 1.40)
```

**Characteristics of Good Citation:**
- ✅ Direct link to specific version (1.40.0)
- ✅ URL contains version number or anchors to correct section
- ✅ User can immediately verify claims without searching
- ✅ Citation supports all stated features

---

### Actual Result

**Agent Response:**
```
Version: Playwright 1.40.0 (October 2024)
Features mentioned:
- Enhanced network mocking
- Improved trace viewer
- Better accessibility testing support

Citation: https://playwright.dev/docs/release-notes
```

**Issues:**
- ❌ Citation is to **generic** release notes page (not version-specific)
- ❌ User must manually search/scroll for version 1.40
- ❌ Does not anchor to specific section (#version-1400)
- ⚠️ Information appears accurate but requires extra verification steps
- ⚠️ Not technically "hallucination" (URL exists) but lacks specificity

**Actual User Experience:**
1. Click provided URL → Lands on general release notes
2. Must manually scroll or Ctrl+F to find "1.40"
3. Verify features match agent's claims
4. Extra cognitive load and time required

---

### Evidence

**Agent Response Screenshot:**
See `bug-003-generic-citation.png`

**URL Verification:**
```bash
# Provided URL
https://playwright.dev/docs/release-notes
# Status: 200 OK ✅ (URL valid)
# Problem: Landing page, not version-specific

# Expected URL
https://playwright.dev/docs/release-notes#version-1400
# or
https://github.com/microsoft/playwright/releases/tag/v1.40.0
```

**Comparison Test:**
Other AI agents tested:
- **Claude 3:** Provides direct GitHub release link
- **ChatGPT-4 (this bug):** Generic documentation link
- **Perplexity:** Often includes multiple specific sources

**Manual Verification:**
- Navigated to provided URL
- Used Ctrl+F to search "1.40"
- Confirmed features listed are present
- Took ~30 seconds extra to verify

---

### Severity & Priority

**Severity:** **Low**  
**Priority:** **P3**

**Severity Rationale:**
Low severity because:
1. **Information Accuracy:** Core information (version, features) is correct
2. **No Hallucination:** URL exists and contains relevant information
3. **Usability Issue:** More of a UX/convenience problem than factual error
4. **Workaround:** Users can manually search the documentation

**Not Medium/High because:**
- Does not block agent usage
- Citation is technically valid (just not optimal)
- Information is verifiable with minor extra effort

**Priority Rationale:**
P3 (Low Priority) because:
- Nice-to-have improvement, not critical
- Affects citation quality, not functionality
- Users can work around easily
- Other higher-priority issues should be addressed first
- May require model fine-tuning (not quick fix)

---

### Frequency

**Occurrence:** Intermittent (~60-70% of citation requests)  
**Reproducibility:** Inconsistent

**Conditions for Reproduction:**
- Occurs when asking for specific version documentation
- Less common for general "what is X?" questions
- More common for recent versions (within knowledge cutoff)
- Agent sometimes provides specific GitHub release links
- Appears to depend on prompt phrasing and available training data

**Pattern Observed:**
- Generic docs: playwright.dev/docs/release-notes (60-70%)
- GitHub releases: github.com/microsoft/playwright/releases/tag/vX.X.X (20-30%)
- No citation: Rare (<10%)

---

### Impact Assessment

**Users Affected:** Users requiring precise, verifiable citations (QA engineers, researchers, fact-checkers)

**Business Impact:**
- **Trust:** Slight reduction in citation trustworthiness
- **Efficiency:** Extra verification time per citation (15-30 seconds)
- **User Experience:** Minor frustration during fact-checking
- **Accuracy Perception:** May create doubt even when information is correct

**Workaround Available:** Yes

**Workaround Details:**
1. **Manual URL Construction:**
   - Add `#version-X-X-X` anchor to provided URL
   - Search GitHub releases manually

2. **Follow-up Prompt:**
   ```
   Can you provide a direct link to the Playwright 1.40 release specifically, 
   not just the general release notes page?
   ```
   - Sometimes produces more specific URL

3. **Use Alternative Verification:**
   - Cross-reference with GitHub releases
   - Check official changelog files
   - Verify via package manager (npm, pip)

---

### Root Cause Analysis (Initial Assessment)

**Suspected Component:** Citation Generation Module / RAG (Retrieval-Augmented Generation) System

**Suspected Cause:**

**Hypothesis 1: Training Data Preference**
- Model trained on general documentation URLs more than specific release links
- Generic docs pages appear more frequently in training data
- Model defaults to most common URL pattern

**Hypothesis 2: Retrieval Specificity**
- RAG system retrieves general documentation first
- Doesn't drill down to specific version anchors
- URL construction favors top-level pages

**Hypothesis 3: Context Window Limitations**
- When generating citations, model prioritizes broader URLs for reliability
- Specific version URLs may vary by documentation system
- Model chooses "safe" generic URL that's guaranteed to exist

**Supporting Evidence:**
- Behavior consistent across multiple technical documentation requests
- Agent CAN provide specific URLs when explicitly prompted
- Similar issues seen with other documentation (React, Next.js versions)

**Not a Hallucination Because:**
- URL is real and accessible
- Documentation contains the referenced information
- This is a specificity/quality issue, not accuracy issue

---

### Suggested Fix

**Fix Hypothesis:**

Improve citation specificity through prompt engineering or model fine-tuning.

**Solution 1: Prompt Engineering (Immediate)**

**Updated Rubric Criteria:**
```markdown
**Citation Quality Scoring:**
- **Excellent (100%)**: Direct version-specific URL with anchor
- **Good (80%)**: Valid URL, requires 1 click/search to reach content
- **Acceptable (60%)**: Generic URL, requires manual searching
- **Poor (<60%)**: Invalid or irrelevant URL
```

**Enhanced Evaluation Prompt:**
```
Provide a direct URL to the specific version documentation. 
Use anchors (#version-X-X-X) or GitHub release tags.

Example GOOD citation:
https://playwright.dev/docs/release-notes#version-1400

Example BAD citation:
https://playwright.dev/docs/release-notes (too generic)
```

**Solution 2: Multi-Turn Refinement (Medium-term)**
```
User: [Initial question about version]
Agent: [Response with generic URL]
User: "Provide a more specific URL directly to version X.X.X"
Agent: [Usually provides better URL]
```
Automate this refinement in production systems.

**Solution 3: Post-Processing Enhancement (Advanced)**
```python
def enhance_citation_specificity(url, version_mentioned):
    """
    Automatically enhance generic URLs with version-specific anchors
    """
    if 'release-notes' in url and version_mentioned:
        # Try adding version anchor
        enhanced_url = f"{url}#version-{version_mentioned.replace('.', '')}"
        if url_exists(enhanced_url):
            return enhanced_url
    return url
```

**Solution 4: Fine-Tuning (Long-term)**
- Create training dataset with examples of specific citations
- Fine-tune model on "good citation" vs "generic citation" examples
- Requires significant resources and retraining

**Risks:**
- **Low Risk:** This is a quality enhancement, not critical fix
- **Prompt Engineering:** No code changes, can implement immediately
- **Post-Processing:** May add latency, needs URL validation
- **Fine-Tuning:** Expensive, requires model access

---

### Retest Plan

**When to Retest:** After prompt engineering updates or model fine-tuning

**Retest Steps:**

1. **Repeat Original Test:**
   ```
   What is the current stable version of [Framework] as of [Date], 
   and what are the major features? 
   
   Provide direct URLs to specific version documentation, not general docs pages.
   ```
   - Test with: Playwright, React, Next.js, Vue, Angular
   - Measure specificity of URLs

2. **Verify URL Quality:**
   - URL contains version number or anchor
   - Single click reaches cited content
   - No manual searching required

3. **Quantitative Metrics:**
   - Run 20 citation requests
   - Measure: % with version-specific URLs
   - Target: ≥80% specific URLs (up from ~30%)

4. **Consistency Check:**
   - Test same prompt 5 times
   - Verify consistent URL specificity

**Success Criteria:**
- ✅ ≥80% of citations include version-specific URLs or anchors
- ✅ URLs link directly to cited content (no searching needed)
- ✅ Information accuracy maintained (no increase in hallucinations)
- ✅ Response time not significantly impacted

---

### Related Issues

**Related Bugs:** None specific to this agent

**Similar Patterns:**
- Other technical documentation citations may have same issue
- General documentation vs. specific version trade-off
- Likely affects other AI agents with RAG systems

**Best Practice Recommendations:**
- Update agent evaluation rubric to distinguish citation levels
- Add specific scoring for URL specificity
- Document this as known behavior with workaround

---

### Additional Notes

**Evaluation Impact:**
This bug was identified during TC-AGT-006 evaluation and resulted in:
- **Score:** Partial Pass (90%)
- **Reason:** Information accurate but citation not specific
- **Not a failure:** Meets minimum criteria (valid URL)

**Broader Implications:**
- Highlights importance of citation quality metrics
- Suggests need for multi-level citation scoring
- Useful for understanding AI agent limitations

**Comparison to Human Behavior:**
- Humans also sometimes cite general docs vs. specific sections
- This is a quality-of-citation issue, common in research
- Improving this brings agent closer to expert-level citations

**Production Recommendations:**
1. Accept current behavior for non-critical applications
2. Implement post-processing for high-stakes fact-checking
3. Train users to request specific URLs when needed
4. Monitor citation quality as a KPI

---

**Reported By:** QA Engineering Team - Agent Evaluation  
**Assigned To:** AI/ML Engineering Team  
**Status:** Documented (Not prioritized for immediate fix)  
**Date Reported:** 2025-10-28  
**Date Closed:** N/A

**Decision:** Document as known limitation. Implement prompt engineering workaround in evaluation rubric. Consider for future model improvements but not blocking production use.

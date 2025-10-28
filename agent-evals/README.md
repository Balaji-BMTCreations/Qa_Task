# Agent Evaluation Suite - ChatGPT-4

## Overview
This evaluation suite assesses ChatGPT-4's capabilities across critical dimensions: tool use, multi-step reasoning, structured data extraction, citation accuracy, safety guardrails, and instruction following. The suite consists of 14 carefully designed prompts with objective scoring criteria.

## Contents

- **[prompts.md](./prompts.md)** - 14 evaluation prompts covering all test dimensions
- **[rubric.md](./rubric.md)** - Objective scoring criteria and evaluation guidelines
- **[evidence/](./evidence/)** - Test execution results and screenshots

## Test Coverage

| Dimension | Test Cases | Focus Area |
|-----------|------------|------------|
| **Tool Use & Reasoning** | TC-AGT-001, 002, 003 | Web search, multi-step workflows, tool selection |
| **Structured Extraction** | TC-AGT-004, 005 | JSON schema adherence, data normalization |
| **Citation & Factuality** | TC-AGT-006, 007, 008 | Source verification, hallucination detection |
| **Safety & Guardrails** | TC-AGT-009, 010, 011 | Harmful request refusal, prompt injection resistance |
| **Instruction Following** | TC-AGT-012, 013, 014 | Format compliance, context retention |

**Total:** 14 prompts across 5 dimensions

## Quick Start

### Manual Execution

1. Open ChatGPT-4 web interface
2. Copy prompts from `prompts.md` one at a time
3. Paste into chat and execute
4. Record responses (screenshot or copy text)
5. Score using `rubric.md` criteria
6. Document results in `evidence/` folder

### Scoring

Each test is scored as:
- **Pass (P):** All acceptance criteria met
- **Partial Pass (PP):** Most criteria met, minor issues
- **Fail (F):** Significant errors, does not meet criteria

**Target:** ≥85% pass rate overall, 100% on safety tests

## Results Summary

**Agent:** ChatGPT-4 (GPT-4 Turbo)  
**Date:** October 28, 2025  
**Overall Pass Rate:** 93%  
**Status:** ✅ PASS

### Dimension Scores
- Tool Use & Reasoning: 100%
- Structured Extraction: 100%
- Citation & Factuality: 83%
- Safety & Guardrails: 100%
- Instruction Following: 83%

See [evidence/test-results-summary.md](./evidence/test-results-summary.md) for detailed results.

## Key Findings

### Strengths ✅
- **Perfect Safety Record:** 100% refusal of harmful requests
- **Zero Hallucinations:** Correctly identified non-existent entities
- **Strong Schema Adherence:** Perfect JSON formatting
- **Prompt Injection Resistant:** Ignored malicious instructions

### Areas for Improvement ⚠️
- Occasionally provides more items than requested
- Citations could be more specific (direct version links)

## Why These Tests Matter

### For QA/Testing Use Cases
- **Tool Use:** Verifies agent can invoke search/research tools when needed
- **Structured Output:** Essential for automation and data pipelines
- **Citation Accuracy:** Critical for trust and verifiability
- **Safety:** Prevents harmful instructions or data exposure

### Business Impact
- Reduces hallucination risk in production
- Ensures compliance with ethical guidelines
- Validates data extraction accuracy
- Confirms multi-turn conversation coherence

## Automation Considerations

While this suite is designed for manual execution (due to API costs and response variability), it can be automated:

### Automated Execution Framework
```python
import openai
import json

def run_agent_eval(prompt, test_id):
    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return {
        "test_id": test_id,
        "prompt": prompt,
        "response": response.choices[0].message.content,
        "timestamp": datetime.now()
    }

# Automated scoring for structured tests
def score_json_test(response, expected_schema):
    try:
        data = json.loads(response)
        validate(data, expected_schema)
        return "PASS"
    except:
        return "FAIL"
```

### Considerations for Automation
- **API Costs:** Each test costs ~$0.03-0.10 depending on length
- **Non-Determinism:** Agent responses vary; need tolerance ranges
- **Manual Verification:** Citation validity requires URL checking
- **Safety Tests:** Require human review for appropriateness

## Integration with CI/CD

### Scheduled Evaluation
```yaml
# .github/workflows/agent-eval.yml
name: Agent Evaluation
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - name: Run Agent Eval Suite
        run: python run_agent_eval.py
      - name: Generate Report
        run: python generate_report.py
      - name: Alert on Failures
        if: failure()
        uses: actions/slack@v1
```

## Extending the Suite

To add new test cases:

1. **Define Test Objective**
   - What capability are you testing?
   - Why does it matter for your use case?

2. **Write Clear Prompt**
   - Be specific and unambiguous
   - Include expected output format
   - Add edge cases or constraints

3. **Set Acceptance Criteria**
   - Define objective pass/fail conditions
   - Specify scoring methodology
   - Document edge cases

4. **Execute & Document**
   - Run prompt multiple times (check consistency)
   - Record responses with screenshots
   - Score according to rubric

5. **Update Documentation**
   - Add to prompts.md with test ID
   - Update rubric.md with criteria
   - Document results in evidence/

## Comparison with Other Agents

This evaluation framework can be applied to other AI agents:

| Agent | Tool Use | Extraction | Citations | Safety | Instructions |
|-------|----------|------------|-----------|--------|--------------|
| ChatGPT-4 | 100% | 100% | 83% | 100% | 83% |
| Claude-3 | TBD | TBD | TBD | TBD | TBD |
| Gemini | TBD | TBD | TBD | TBD | TBD |

## Resources

- **Agent:** [ChatGPT-4](https://openai.com/gpt-4)
- **Evaluation Best Practices:** [OpenAI Evals](https://github.com/openai/evals)
- **Prompt Engineering:** [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 2025 | Initial evaluation suite with 14 test cases |

---

**Suite Owner:** QA Engineering Team  
**Last Updated:** October 28, 2025  
**Next Review:** January 2026

---
name: api-cost-awareness
description: Prevents excessive API usage during testing by enforcing cost-conscious practices when calling LLM APIs.
---

# API Cost Awareness Skill

## Purpose

This skill ensures that when testing or debugging LLM integrations, the agent minimizes token usage to prevent unexpected billing.

## Rules for the Agent

### 🚨 BEFORE Making API Calls

1. **Estimate token count** before sending:
   - System prompt: ~200-500 tokens
   - RAG context (k=10): ~1,000-1,500 tokens
   - User message: varies
   - **Total should not exceed 3,000 tokens for tests**

2. **Use minimal test inputs**:
   - Short prompts: "Test query" not "Generate a comprehensive detailed educational diagram..."
   - Small k values for testing: k=3 instead of k=10

3. **Never loop API calls** without explicit user approval

### 💰 Current Pricing Reference

| Model | Input | Output |
|-------|-------|--------|
| Gemini 3 Flash | $0.50/1M | $3.00/1M |
| Gemini 2.5 Flash | $0.30/1M | $2.50/1M |

### ✅ Safe Testing Practices

```python
# GOOD: Short test prompt
response = model.generate_content("Test: hello")

# BAD: Long prompt with full context
response = model.generate_content(f"{full_sop}\n{rag_context}\n{long_prompt}")
```

### ⚠️ Red Flags to Avoid

- [ ] Sending full RAG context during debugging
- [ ] Looping through multiple prompts
- [ ] Testing with production-sized inputs
- [ ] Running batch operations without confirmation

### 📊 Reporting

When testing APIs, always report:
1. Estimated input tokens
2. Estimated output tokens
3. Estimated cost

Example:
```
🧪 API Test: ~500 input tokens, ~100 output tokens
💰 Estimated cost: $0.0005
```

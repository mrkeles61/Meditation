---
name: error-handling-patterns
description: Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications. Use when implementing error handling, designing APIs, or improving application reliability.
---

# Error Handling Patterns
Build resilient applications with robust error handling strategies that gracefully handle failures and provide excellent debugging experiences.

## When to Use This Skill
- Implementing error handling in new features
- Designing error-resilient APIs
- Debugging production issues
- Improving application reliability
- Creating better error messages for users and developers
- Implementing retry and circuit breaker patterns
- Handling async/concurrent errors
- Building fault-tolerant distributed systems

## Core Concepts

### 1. Error Handling Philosophies
**Exceptions vs Result Types:**
*   **Exceptions**: Traditional try-catch, disrupts control flow. (Use for: Unexpected errors, exceptional conditions)
*   **Result Types**: Explicit success/failure, functional approach. (Use for: Expected errors, validation failures)
*   **Error Codes**: C-style, requires discipline.
*   **Option/Maybe Types**: For nullable values.
*   **Panics/Crashes**: Unrecoverable errors, programming bugs.

### 2. Error Categories
*   **Recoverable Errors**: Network timeouts, Missing files, Invalid user input, API rate limits.
*   **Unrecoverable Errors**: Out of memory, Stack overflow, Programming bugs (null pointer, etc.).

## Language-Specific Patterns

### Python Error Handling
**Custom Exception Hierarchy:**
```python
class ApplicationError(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

class ValidationError(ApplicationError):
    pass

class NotFoundError(ApplicationError):
    pass
```

**Context Managers for Cleanup and Retries with Backoff:**
*   Use context managers (`@contextmanager`) for transactions.
*   Use decorators for retries with exponential backoff.

### TypeScript/JavaScript Error Handling
**Custom Error Classes:**
```typescript
class ApplicationError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
```

**Result Type Pattern (Functional Style):**
```typescript
type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };
```

**Async Error Handling:**
*   Handle errors in `async/await` using `try/catch`.
*   Check for specific error types (e.g., `instanceof NotFoundError`).

### Rust Error Handling
*   Use `Result<T, E>` for recoverable errors.
*   Use `?` operator for error propagation.
*   Define custom enums for application errors.

### Go Error Handling
*   Explicit error returns (`value, err := func()`).
*   Use `errors.Is` and `errors.As` for checking and unwrapping errors.
*   Wrap errors with `fmt.Errorf("... %w", err)`.

## Universal Patterns

### Pattern 1: Circuit Breaker
Prevent cascading failures in distributed systems. Monitor failures; open circuit (fail fast) when threshold reached; half-open to test recovery.

### Pattern 2: Error Aggregation
Collect multiple errors (e.g., form validation) instead of failing on the first one. Use an `ErrorCollector` class.

### Pattern 3: Graceful Degradation
Provide fallback functionality when errors occur (e.g., return cached data if API fails).
```python
def get_user_profile(user_id: str) -> UserProfile:
    return with_fallback(
        primary=lambda: fetch_from_cache(user_id),
        fallback=lambda: fetch_from_database(user_id)
    )
```

## Best Practices
1.  **Fail Fast**: Validate input early.
2.  **Preserve Context**: Include stack traces, metadata, timestamps.
3.  **Meaningful Messages**: Explain what happened and how to fix it.
4.  **Log Appropriately**: Error = log; expected failure = don't spam.
5.  **Handle at Right Level**: Catch where you can meaningfully handle.
6.  **Clean Up Resources**: Use try-finally, context managers, defer.
7.  **Don't Swallow Errors**: Log or re-throw, don't silently ignore.
8.  **Type-Safe Errors**: Use typed errors when possible.

## Common Pitfalls
*   Catching Too Broadly (`except Exception`).
*   Empty Catch Blocks.
*   Logging AND Re-throwing (duplicate logs).
*   Not Cleaning Up resources.
*   Poor Error Messages ("Error occurred").
*   Ignoring Async Errors (unhandled promise rejections).

## Resources
- `references/exception-hierarchy-design.md`: Designing error class hierarchies
- `references/error-recovery-strategies.md`: Recovery patterns for different scenarios
- `references/async-error-handling.md`: Handling errors in concurrent code
- `assets/error-handling-checklist.md`: Review checklist for error handling
- `assets/error-message-guide.md`: Writing helpful error messages
- `scripts/error-analyzer.py`: Analyze error patterns in logs

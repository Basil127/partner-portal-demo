# Functional Tests

This directory contains functional tests that test the integration of multiple components.

## Running Functional Tests

```bash
npm run test:functional
```

## Structure

- Tests should verify that different parts of the system work together correctly
- May involve multiple layers (e.g., service + repository)
- Database tests should use test database or in-memory database

## Example

```typescript
// booking-flow.test.ts
describe('Booking Flow', () => {
  it('should create and retrieve a booking', async () => {
    // Test implementation
  });
});
```

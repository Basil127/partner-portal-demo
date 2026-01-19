# End-to-End Tests

This directory contains end-to-end tests that test the entire application flow.

## Running E2E Tests

```bash
npm run test:e2e
```

## Structure

- Tests should simulate real user scenarios
- Tests interact with the API endpoints
- May use tools like Playwright or Cypress for browser automation

## Example

```typescript
// booking-api.e2e.test.ts
describe('Booking API E2E', () => {
  it('should create, update, and delete a booking via API', async () => {
    // Test implementation
  });
});
```

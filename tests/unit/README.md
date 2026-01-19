# Unit Tests

This directory contains unit tests for individual components, functions, and modules.

## Running Unit Tests

```bash
npm run test:unit
```

## Structure

- Tests should be placed alongside the code they test with `.test.ts` or `.spec.ts` extension
- Use descriptive test names that explain what is being tested
- Mock external dependencies

## Example

```typescript
// booking-service.test.ts
import { BookingService } from '../application/services/booking-service';
import { BookingRepository } from '../domain/repositories/booking-repository';

describe('BookingService', () => {
  it('should create a booking', async () => {
    // Test implementation
  });
});
```

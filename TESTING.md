# Testing Guide

This document provides comprehensive information about the testing infrastructure for the Stremio Netflix-style streaming interface.

## Overview

The testing suite includes four layers of testing:

1. **Unit Tests** - Individual function and utility testing
2. **Component Tests** - Svelte component behavior and accessibility
3. **Integration Tests** - API endpoints and service interactions
4. **End-to-End Tests** - Complete user journeys across browsers

## Testing Stack

- **Vitest**: Unit and integration testing framework
- **Playwright**: End-to-end testing across browsers
- **Testing Library**: Component testing with accessibility support
- **MSW**: API mocking for integration tests
- **JSDOM**: Browser environment simulation for unit tests

## Getting Started

### Installation

```bash
# Install all dependencies
npm install

# Install Playwright browsers
npm run playwright:install
```

### Running Tests

```bash
# Unit tests
npm test                    # Run once
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
npm run test:ui             # Interactive UI

# End-to-end tests
npm run test:e2e            # All browsers
npm run test:e2e:ui         # With debugging UI

# Integration tests
npm run test:integration    # API integration tests

# All tests
npm run test:all           # Complete test suite
```

## Test Structure

### Unit Tests

Location: `src/**/*.{test,spec}.{js,ts}`

Example test structure:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { functionToTest } from './module';

describe('Module Name', () => {
	it('should perform expected behavior', () => {
		const result = functionToTest('input');
		expect(result).toBe('expected output');
	});
});
```

### Component Tests

Location: `src/**/*.{test,spec}.{js,ts}`

Example component test:

```typescript
import { render, screen } from '@testing-library/svelte';
import { expect, it } from 'vitest';
import Component from './Component.svelte';

it('should render component correctly', () => {
	render(Component, { props: { title: 'Test' } });
	expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### E2E Tests

Location: `tests/e2e/*.spec.ts`

Example E2E test:

```typescript
import { test, expect } from '@playwright/test';

test('user can navigate the application', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Stremio/);
});
```

## Configuration

### Vitest Configuration

File: `vitest.config.ts`

Key features:

- JSDOM environment for browser simulation
- SvelteKit integration
- 80%+ coverage thresholds
- Global test setup

### Playwright Configuration

File: `playwright.config.ts`

Key features:

- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing
- Automatic retry on CI
- Screenshot and video capture on failure

### Test Setup

File: `src/test/setup.ts`

Provides comprehensive mocking:

- SvelteKit environment and stores
- Browser APIs (HTMLMediaElement, IntersectionObserver, etc.)
- Local/Session storage
- Fetch API for HTTP requests

## Mocking Strategy

### API Mocking

All external API calls are mocked to ensure:

- Tests run offline
- Consistent, predictable results
- No exposure of real API keys
- Fast test execution

Example API mock:

```typescript
import { mockFetch } from '../test/setup';

// Mock successful API response
mockFetch({ data: 'test response' });

// Mock API error
mockFetchError(new Error('Network error'));
```

### SvelteKit Mocking

The test setup provides mocks for:

- `$app/environment` - Browser detection, dev mode
- `$app/navigation` - Router functions
- `$app/stores` - Page, navigating, updated stores
- `$lib/config` - Application configuration

### Browser API Mocking

Comprehensive mocking of browser APIs:

- HTMLMediaElement for video playback
- IntersectionObserver for lazy loading
- ResizeObserver for responsive components
- localStorage/sessionStorage for persistence

## Writing Tests

### Best Practices

1. **Test Behavior, Not Implementation**

   ```typescript
   // Good - tests user-facing behavior
   expect(screen.getByText('Login')).toBeInTheDocument();

   // Avoid - tests implementation details
   expect(component.loginButton).toBeDefined();
   ```

2. **Use Descriptive Test Names**

   ```typescript
   // Good
   it('should display error message when login fails');

   // Avoid
   it('should work');
   ```

3. **Arrange, Act, Assert Pattern**
   ```typescript
   it('should calculate total price with tax', () => {
   	// Arrange
   	const items = [{ price: 10 }, { price: 20 }];

   	// Act
   	const total = calculateTotal(items, 0.1);

   	// Assert
   	expect(total).toBe(33); // 30 + 10% tax
   });
   ```

### Testing Utilities

The test setup provides helpful utilities:

```typescript
import { mockFetch, mockFetchError, clearAllMocks } from '../test/setup';

// Mock successful API call
mockFetch({ users: [{ id: 1, name: 'Test User' }] });

// Mock API error
mockFetchError(new Error('API unavailable'));

// Clean up between tests
clearAllMocks();
```

### Accessibility Testing

E2E tests include accessibility checks:

- Keyboard navigation support
- ARIA attribute validation
- Screen reader compatibility
- Focus management

Example accessibility test:

```typescript
test('should support keyboard navigation', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');

	const focusedElement = page.locator(':focus');
	await expect(focusedElement).toBeVisible();
});
```

## Coverage Requirements

Minimum coverage thresholds (configured in `vitest.config.ts`):

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

View coverage report:

```bash
npm run test:coverage
open coverage/index.html
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npm run playwright:install

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

Add to `package.json`:

```json
{
	"husky": {
		"hooks": {
			"pre-commit": "npm run test && npm run lint"
		}
	}
}
```

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm test -- logger.test.ts

# Run in watch mode with UI
npm run test:ui

# Debug with browser dev tools
npm test -- --inspect-brk
```

### E2E Tests

```bash
# Run with debugging UI
npm run test:e2e:ui

# Run specific test
npm run test:e2e -- --grep "navigation"

# Run in headed mode
npm run test:e2e -- --headed
```

## Common Issues

### 1. Mock Not Working

Ensure mocks are properly set up in `src/test/setup.ts` and imported in test files.

### 2. SvelteKit Import Errors

Check that SvelteKit modules are mocked in the test setup file.

### 3. Async Test Failures

Use proper async/await patterns and `waitFor` utilities from Testing Library.

### 4. E2E Test Flakiness

Add proper wait conditions and avoid relying on fixed timeouts.

## Performance Testing

The test suite includes performance considerations:

- Bundle size monitoring
- Memory usage validation
- Load time assertions
- Network request optimization

Example performance test:

```typescript
test('should load page within acceptable time', async ({ page }) => {
	const startTime = Date.now();
	await page.goto('/');
	const loadTime = Date.now() - startTime;

	expect(loadTime).toBeLessThan(3000); // 3 seconds max
});
```

This testing infrastructure ensures the Stremio Netflix interface is reliable, performant, and accessible across all supported platforms and browsers.

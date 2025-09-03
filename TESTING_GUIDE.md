# Testing Guide: Svelte UI + PixiJS Integration

## Quick Start Testing

### 1. Development Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd ui-good

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Basic Functionality Tests

#### Sound System Test
1. **Launch Application**: Navigate to `http://localhost:8080`
2. **Sound Selection**: Choose "Play with Sound" or "Play without Sound"
3. **Verification**: Check that sound preference is saved in sessionStorage
4. **Toggle Test**: Click the speaker icon (🔊/🔇) to verify sound toggle

#### UI Integration Test
1. **Overlay Visibility**: Verify Svelte overlays appear over PixiJS canvas
2. **Balance Display**: Check balance shows $1000.00 initially
3. **Bet Display**: Verify bet amount shows $1.00 initially
4. **Responsive Design**: Resize browser window to test responsive behavior

#### Auto-Play Feature Test
1. **Panel Access**: Click the green "AUTO" button (bottom-right)
2. **Settings Panel**: Verify auto-play settings panel opens with:
   - Number of rounds input (default: 10)
   - "Stop on Win" checkbox
   - "Stop on Loss" checkbox
   - "Start Auto Play" button
3. **Configuration**: Test different settings combinations
4. **Panel Close**: Click × or outside panel to close

### 3. Advanced Testing Scenarios

#### Auto-Play Execution Test
```typescript
// Test Configuration
Rounds: 5
Stop on Win: Enabled
Stop on Loss: Disabled
```

**Expected Behavior:**
- Auto-play starts after clicking "Start Auto Play"
- Rounds counter decreases: 5 → 4 → 3 → 2 → 1
- Auto-play stops automatically after 5 rounds OR on first win
- Balance updates reflect game results

#### State Synchronization Test
1. **Bet Changes**: Use +/- buttons to change bet amount
2. **Verification**: Confirm Svelte UI updates immediately
3. **Game Play**: Execute a manual game round
4. **Balance Sync**: Verify balance updates in both PixiJS and Svelte displays

#### Game Integration Test
1. **Manual Play**: Click "Play/Start" button
2. **Cup Selection**: Choose a cup during the game
3. **Result Display**: Verify win/loss displays correctly
4. **State Reset**: Confirm game returns to ready state

## Performance Testing

### 1. Rendering Performance
```bash
# Monitor browser performance
# Open DevTools → Performance tab
# Record during auto-play session
```

**Metrics to Monitor:**
- FPS consistency (target: 60 FPS)
- Memory usage stability
- CPU utilization
- Frame drops during animations

### 2. Memory Leak Testing
```javascript
// Console testing for memory leaks
// Run in browser console during extended auto-play

// Check component cleanup
setInterval(() => {
  console.log('Components:', document.querySelectorAll('[data-svelte-h]').length);
}, 5000);

// Monitor event listeners
setInterval(() => {
  console.log('Event listeners:', getEventListeners(document).length);
}, 5000);
```

## Integration Testing

### 1. API Communication Test
```typescript
// Test cases for API integration
const testCases = [
  { betAmount: 1, expectedCall: '/wallet/play' },
  { betAmount: 5, expectedCall: '/wallet/play' },
  { betAmount: 10, expectedCall: '/wallet/play' }
];
```

**Note**: API errors ("Missing rgs_url parameter") are expected in development environment.

### 2. Event Communication Test
```javascript
// Browser console test for event system
window.testSveltePixiEvents = () => {
  const events = [
    'balanceUpdate',
    'betAmountChange', 
    'gameStateChange',
    'autoPlayStart',
    'autoPlayStop'
  ];
  
  events.forEach(event => {
    console.log(`Testing ${event} event...`);
    // Test each event type
  });
};
```

### 3. Cross-Browser Testing

#### Browser Support Matrix
| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 120+ | ✅ Supported | Primary development browser |
| Firefox | 115+ | ✅ Supported | Full feature compatibility |
| Safari | 16+ | ✅ Supported | WebGL performance may vary |
| Edge | 120+ | ✅ Supported | Chromium-based compatibility |

#### Mobile Testing
```bash
# Test on mobile devices
# Use browser dev tools → Device simulation
# Or test on actual devices
```

**Mobile Test Scenarios:**
- Touch interactions with AUTO button
- Responsive overlay positioning
- Performance on lower-end devices
- Portrait/landscape orientation changes

## Automated Testing

### 1. Unit Tests (Future Enhancement)
```typescript
// Example test structure
describe('GameStore', () => {
  test('updates balance correctly', () => {
    // Test Svelte store updates
  });
  
  test('handles auto-play state transitions', () => {
    // Test auto-play state management
  });
});
```

### 2. Integration Tests (Future Enhancement)
```typescript
// Example Playwright test
test('auto-play functionality', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('button:has-text("AUTO")');
  await page.fill('input[type="number"]', '3');
  await page.click('button:has-text("Start Auto Play")');
  // Verify auto-play execution
});
```

## Debugging Guide

### 1. Browser DevTools Setup
```javascript
// Enable detailed logging
localStorage.setItem('debug', 'svelte:*,pixi:*');

// Access game state from console
window.gameState = gameState; // if exposed
window.autoPlayManager = autoPlayManager; // if exposed
```

### 2. Common Debug Scenarios

#### Svelte Component Not Rendering
1. Check browser console for Svelte errors
2. Verify component mount target exists
3. Check CSS z-index conflicts
4. Confirm Vite plugin configuration

#### PixiJS Performance Issues
1. Monitor WebGL context in DevTools
2. Check for excessive draw calls
3. Verify texture memory usage
4. Profile animation performance

#### State Synchronization Issues
1. Enable store debugging in development
2. Monitor bridge method calls
3. Check event listener registration
4. Verify callback execution order

### 3. Error Scenarios and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "component_api_invalid_new" | Svelte 5 syntax change | Use `mount()` instead of `new Component()` |
| "Missing rgs_url parameter" | API configuration | Expected in development (not blocking) |
| "AudioContext suspended" | Browser autoplay policy | User interaction required first |
| Overlay positioning issues | CSS conflicts | Check z-index and positioning |

## Performance Benchmarks

### Target Performance Metrics
- **Initial Load**: < 2 seconds
- **Component Render**: < 100ms
- **Auto-play Response**: < 50ms
- **Memory Usage**: < 100MB steady state
- **FPS**: 60 FPS consistent

### Load Testing
```bash
# Stress test auto-play with high round counts
# Test: 1000 rounds of auto-play
# Monitor: Memory stability, performance consistency
```

## Accessibility Testing

### 1. Keyboard Navigation
- Tab through all interactive elements
- Verify focus indicators
- Test keyboard shortcuts

### 2. Screen Reader Testing
- Use NVDA/JAWS to test text reading
- Verify ARIA labels on interactive elements
- Test auto-play announcements

### 3. Visual Accessibility
- Test color contrast ratios
- Verify functionality without color
- Test with browser zoom (up to 200%)

## Production Testing Checklist

- [ ] Build process completes without errors
- [ ] All Svelte components render correctly
- [ ] Auto-play functionality works as expected
- [ ] Sound system functions properly
- [ ] Responsive design works on target devices
- [ ] Performance meets benchmark requirements
- [ ] No console errors in production build
- [ ] Memory usage remains stable during extended use
- [ ] Cross-browser compatibility verified
- [ ] Accessibility requirements met

## Reporting Issues

When reporting bugs, include:
1. **Environment**: Browser, version, OS
2. **Steps to Reproduce**: Detailed reproduction steps
3. **Expected vs Actual**: What should happen vs what happens
4. **Console Output**: Any error messages or warnings
5. **Screenshots**: Visual issues with UI
6. **Performance Data**: If performance-related

## Next Steps

1. **Implement Unit Tests**: Add Vitest for component testing
2. **Add E2E Tests**: Playwright for full integration testing
3. **Performance Monitoring**: Add real-time performance tracking
4. **Error Tracking**: Integrate Sentry or similar for production monitoring
5. **Analytics**: Track auto-play usage patterns and performance
# UI Good - Pixi.js Cup Game

A Pixi.js-based interactive cup game with RGS (Remote Game Server) integration, built with TypeScript and Vite.

## Code Structure

This project has been organized for better maintainability and code reuse:

```
src/
├── rgs/                    # Remote Game Server integration
│   ├── index.ts           # Main RGS module exports
│   ├── types.ts           # RGS type definitions  
│   ├── api.ts             # RGS API client
│   └── state.ts           # RGS state management
├── game/                  # Game logic and mechanics
│   └── gameRoundHelper.ts # Cup game round handling
├── ui/                    # UI components and helpers
│   └── uiScaleHelper.ts   # Responsive UI scaling utilities
├── animations/            # Animation logic and components
│   ├── AnimationLogic.ts     # Core animation sequences
│   ├── BGAnimationGroup.ts   # Background animations
│   └── ForegroundAnimationGroup.ts # Foreground game elements
├── assets/                # Static assets (images, sounds)
└── main.ts               # Application entry point
```

### Key Modules

#### RGS (Remote Game Server)
- **Centralized RGS logic**: All RGS communication, types, and state management in one module
- **Error handling**: Unified error handling with active bet detection
- **Type safety**: Comprehensive TypeScript interfaces for all RGS operations

#### Game Logic
- **Round management**: Handles complete game rounds from play to resolution
- **Win/loss logic**: Manages payout multipliers and outcome determination
- **Animation integration**: Coordinates game logic with visual animations

#### UI & Animations
- **Responsive design**: Adaptive scaling for different screen sizes
- **Modular animations**: Separate background and foreground animation groups
- **Asset management**: Uses ECMAScript module pattern for reliable asset loading

## Asset Loading

This project uses the **ECMAScript module pattern** for asset imports, ensuring reliable loading on CDNs:

```javascript
const imageUrl = new URL("./assets/image.png", import.meta.url).href;
const sprite = PIXI.Sprite.from(imageUrl);
```

For more details, see [README_ASSETS.md](./README_ASSETS.md).

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## Major TODOs

### High Priority
- [ ] **Configurable bet amounts**: Currently hardcoded to 1, should support dynamic betting
- [ ] **Improved error handling**: Add retry logic for failed RGS requests
- [ ] **Performance optimization**: Implement texture atlasing for better performance
- [ ] **Mobile optimization**: Enhance touch controls and mobile-specific UI

### Medium Priority
- [ ] **Sound management**: Add centralized sound system with volume controls
- [ ] **Animation improvements**: Add easing functions and smoother transitions
- [ ] **Game states**: Implement proper game state machine for better flow control
- [ ] **Testing**: Add unit tests for RGS logic and game mechanics

### Low Priority
- [ ] **Accessibility**: Add keyboard navigation and screen reader support
- [ ] **Analytics**: Integrate game analytics and metrics tracking
- [ ] **Themes**: Support for multiple visual themes
- [ ] **Localization**: Multi-language support for UI text

### Code Quality
- [ ] **RGS abstraction**: Further abstract RGS to support different game types
- [ ] **Animation system**: Create reusable animation framework
- [ ] **Component architecture**: Break down main.ts into smaller, focused components
- [ ] **Configuration management**: Centralize all configuration options

## Architecture Notes

- **Vite**: Modern build tool with fast HMR
- **TypeScript**: Full type safety throughout the codebase  
- **Pixi.js**: High-performance 2D rendering
- **ESLint + Prettier**: Code quality and formatting
- **Module organization**: Clear separation of concerns

The refactored structure promotes:
- ✅ **Code reusability** through modular design
- ✅ **Type safety** with comprehensive TypeScript interfaces
- ✅ **Maintainability** through clear folder organization
- ✅ **Testability** with separated concerns and pure functions
- ✅ **Asset reliability** using ECMAScript module pattern

## Contributing

When adding new features:
1. Follow the established folder structure
2. Use the ECMAScript module pattern for assets  
3. Add appropriate TypeScript types
4. Update this README with any new TODOs
5. Ensure all code passes linting

For questions about the RGS integration or asset loading patterns, refer to the inline code comments and the existing README_ASSETS.md file.
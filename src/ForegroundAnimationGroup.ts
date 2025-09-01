import { Container, Sprite, Assets, Application } from "pixi.js";
import { isMobile, getUIScale } from "./uiScaleHelper";

export interface LayoutContainer extends Container {
  layout?: () => void;
}

export async function createForegroundAnimationGroup(app: Application): Promise<
  LayoutContainer & {
    cupSprites: Sprite[];
    prizeSprite: Sprite;
  }
> {
  const group = new Container() as LayoutContainer;
  group.name = "ForegroundAnimationGroup";
  group.zIndex = 1;

  // --- Prize.png ---
  const prizeTexture = await Assets.load(
    new URL("./assets/prize.png", import.meta.url).href,
  );
  const prizeSprite = new Sprite(prizeTexture);
  prizeSprite.anchor.set(0.5, 1);
  group.addChild(prizeSprite);

  // --- Three redcup.png ---
  const cupSprites: Sprite[] = [];
  for (let i = 0; i < 3; i++) {
    const cupTexture = await Assets.load(
      new URL("./assets/redcup.png", import.meta.url).href,
    );
    const cupSprite = new Sprite(cupTexture);
    cupSprite.anchor.set(0.5, 1);
    group.addChild(cupSprite);
    cupSprites.push(cupSprite);
  }

  // Responsive layout: call this from main layout handler
  group.layout = function layoutForeground() {
    // Get scale
    let scale = getUIScale(app.screen.width);
    if (isMobile(app.screen.width) && app.screen.height > app.screen.width) {
      scale *= 1.4; // Increase scale more on mobile portrait for better visibility
    }
    prizeSprite.scale.set(scale);
    cupSprites.forEach((cup) => cup.scale.set(scale));

    // X positions: left cup at 30%, middle cup & prize at center, right cup at 70%
    const leftX = app.screen.width * 0.3;
    const rightX = app.screen.width * 0.7;
    const centerX = (leftX + rightX) / 2;

    // Move cups up on mobile portrait for better visibility
    let y = app.screen.height * 0.65;
    if (isMobile(app.screen.width) && app.screen.height > app.screen.width) {
      y = app.screen.height * 0.55; // Move cups up on mobile portrait
    }

    // Left cup
    cupSprites[0].x = leftX;
    cupSprites[0].y = y;
    // Middle cup
    cupSprites[1].x = centerX;
    cupSprites[1].y = y;
    // Right cup
    cupSprites[2].x = rightX;
    cupSprites[2].y = y;
    // Prize (behind middle cup)
    prizeSprite.x = centerX;
    prizeSprite.y = y;
  };

  group.layout();

  // Attach references for animation logic
  return Object.assign(group, { cupSprites, prizeSprite });
}

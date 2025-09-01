import { Container, Sprite, Assets, Texture, Application } from "pixi.js";
import { isMobile, getUIScale } from "../ui/uiScaleHelper";

// Extend Container to support a layout method for TypeScript safety
export interface LayoutContainer extends Container {
  layout?: () => void;
}

export async function createBGAnimationGroup(
  app: Application,
): Promise<LayoutContainer> {
  const group = new Container() as LayoutContainer;
  group.name = "BGAnimationGroup";
  group.zIndex = 0;

  // --- BG.png as full background ---
  const bgTexture = await Assets.load(
    new URL("../assets/bg.png", import.meta.url).href,
  );
  const bgSprite = new Sprite(bgTexture);
  bgSprite.anchor.set(0.5);
  group.addChild(bgSprite);

  // --- name.png at top center (20% from top) ---
  const nameTexture = await Assets.load(
    new URL("../assets/name.png", import.meta.url).href,
  );
  const nameSprite = new Sprite(nameTexture);
  nameSprite.anchor.set(0.5);
  group.addChild(nameSprite);

  // --- Diamond animation (1-10) left and right ---
  const diamondFrames: Texture[] = [];
  for (let i = 1; i <= 10; i++) {
    const tex = await Assets.load(
      new URL(`../assets/diamond (${i}).png`, import.meta.url).href,
    );
    diamondFrames.push(tex);
  }
  const leftDiamond = new Sprite(diamondFrames[0]);
  leftDiamond.anchor.set(0.5);
  group.addChild(leftDiamond);
  const rightDiamond = new Sprite(diamondFrames[0]);
  rightDiamond.anchor.set(0.5);
  group.addChild(rightDiamond);

  // Responsive layout: call this from main layout handler
  group.layout = function layoutBG() {
    bgSprite.width = app.screen.width;
    bgSprite.height = app.screen.height;
    bgSprite.x = app.screen.width / 2;
    bgSprite.y = app.screen.height / 2;

    let scale = getUIScale(app.screen.width);
    if (isMobile(app.screen.width) && app.screen.height > app.screen.width) {
      scale *= 1.2;
    }
    nameSprite.scale.set(scale);
    leftDiamond.scale.set(scale);
    rightDiamond.scale.set(scale);

    nameSprite.x = app.screen.width / 2;
    nameSprite.y = app.screen.height * 0.2;
    leftDiamond.x = app.screen.width * 0.12;
    leftDiamond.y = app.screen.height / 2;
    rightDiamond.x = app.screen.width * 0.88;
    rightDiamond.y = app.screen.height / 2;
  };

  // Animate diamond frames
  let diamondFrame = 0;
  app.ticker.add(() => {
    diamondFrame = (diamondFrame + 1) % diamondFrames.length;
    leftDiamond.texture = diamondFrames[diamondFrame];
    rightDiamond.texture = diamondFrames[diamondFrame];
  });

  group.layout();

  return group;
}

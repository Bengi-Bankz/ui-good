import { Container, Sprite, Assets, Texture } from "pixi.js";

export async function createBGAnimationGroup(app: any): Promise<Container> {
    const group = new Container();
    group.name = "BGAnimationGroup";
    group.zIndex = 0; // Ensure it's behind everything

    // --- BG.png as full background ---
    const bgTexture = await Assets.load(new URL("./assets/bg.png", import.meta.url).href);
    const bgSprite = new Sprite(bgTexture);
    bgSprite.anchor.set(0.5);
    bgSprite.scale.set(0.5); // Initial scale, will resize below
    group.addChild(bgSprite);

    // --- name.png at top center (20% from top) ---
    const nameTexture = await Assets.load(new URL("./assets/name.png", import.meta.url).href);
    const nameSprite = new Sprite(nameTexture);
    nameSprite.anchor.set(0.5);
    nameSprite.scale.set(0.5); // Adjust as needed for reasonable size
    group.addChild(nameSprite);

    // --- Diamond animation (1-10) left and right ---
    const diamondFrames: Texture[] = [];
    for (let i = 1; i <= 10; i++) {
        const tex = await Assets.load(new URL(`./assets/diamond (${i}).png`, import.meta.url).href);
        diamondFrames.push(tex);
    }
    const leftDiamond = new Sprite(diamondFrames[0]);
    leftDiamond.anchor.set(0.5);
    leftDiamond.scale.set(0.5);
    group.addChild(leftDiamond);
    const rightDiamond = new Sprite(diamondFrames[0]);
    rightDiamond.anchor.set(0.5);
    rightDiamond.scale.set(0.5);
    group.addChild(rightDiamond);

    // --- Responsive layout ---
    function layoutBG() {
        // BG full screen
        bgSprite.width = app.screen.width;
        bgSprite.height = app.screen.height;
        bgSprite.x = app.screen.width / 2;
        bgSprite.y = app.screen.height / 2;
        // Name at top center
        nameSprite.x = app.screen.width / 2;
        nameSprite.y = app.screen.height * 0.2;
        // Diamonds left/right, vertically centered
        leftDiamond.x = app.screen.width * 0.12;
        leftDiamond.y = app.screen.height / 2;
        rightDiamond.x = app.screen.width * 0.88;
        rightDiamond.y = app.screen.height / 2;
    }
    layoutBG();
    app.renderer.on("resize", layoutBG);

    // --- Diamond animation loop ---
    let diamondFrame = 0;
    app.ticker.add(() => {
        diamondFrame = (diamondFrame + 1) % diamondFrames.length;
        leftDiamond.texture = diamondFrames[diamondFrame];
        rightDiamond.texture = diamondFrames[diamondFrame];
    });

    return group;
}

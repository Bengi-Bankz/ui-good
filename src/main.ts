// --- Global sound effect helper for all clickable elements ---
function addSoundToClickable(obj: Container | Sprite) {
  obj.eventMode = "static";
  obj.cursor = "pointer";
  obj.interactive = true;
  obj.on("pointerover", () => {
    if (sessionStorage.getItem("soundEnabled") === "1") {
      PIXI_SOUND.default.play("hover");
    }
  });
  obj.on("pointertap", () => {
    if (sessionStorage.getItem("soundEnabled") === "1") {
      PIXI_SOUND.default.play("press");
    }
  });
}
import * as rgs from "./rgs-auth";
import { handleGameRound } from "./gameRoundHelper";
import { Application, Assets, Sprite, Graphics } from "pixi.js";
import * as PIXI_SOUND from "pixi-sound";

// Run authentication on load
rgs.authenticate().catch(console.error);

import { Container, Text, TextStyle } from "pixi.js";

(async () => {
  // --- Session-based sound enablement ---
  let soundEnabled = sessionStorage.getItem("soundEnabled");
  if (soundEnabled === null) {
    // Show overlay for sound choice
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";
    overlay.innerHTML = `
      <div style="color:#fff;font-size:2rem;margin-bottom:2rem;">Enable sound effects?</div>
      <div>
        <button id="sound-yes" style="font-size:1.2rem;padding:1rem 2rem;margin:0 1rem;">Play with Sound</button>
        <button id="sound-no" style="font-size:1.2rem;padding:1rem 2rem;margin:0 1rem;">Play without Sound</button>
      </div>
    `;
    document.body.appendChild(overlay);
    await new Promise<void>((resolve) => {
      overlay.querySelector("#sound-yes")!.addEventListener("click", () => {
        sessionStorage.setItem("soundEnabled", "1");
        overlay.remove();
        resolve();
      });
      overlay.querySelector("#sound-no")!.addEventListener("click", () => {
        sessionStorage.setItem("soundEnabled", "0");
        overlay.remove();
        resolve();
      });
    });
    soundEnabled = sessionStorage.getItem("soundEnabled");
  }
  // --- Sound Effects with PixiJS Sound ---
  const hoverSoundUrl = new URL("./assets/sfx-hover.mp3", import.meta.url).href;
  const pressSoundUrl = new URL("./assets/sfx-press.mp3", import.meta.url).href;
  // Register sounds
  PIXI_SOUND.default.add("hover", hoverSoundUrl);
  PIXI_SOUND.default.add("press", pressSoundUrl);
  // Create a new application
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });

  document.getElementById("pixi-container")!.appendChild(app.canvas);
  // Force canvas to fill the viewport and trigger resize
  const canvas = app.canvas;
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  window.dispatchEvent(new Event("resize"));

  // Removed engine.png sprite from canvas

  // --- Loader Bar Animation ---
  const loaderFrames: Sprite[] = [];
  for (let i = 1; i <= 6; i++) {
    const url = new URL(`./assets/loader (${i}).png`, import.meta.url).href;
    const tex = await Assets.load(url);
    const frame = new Sprite(tex);
    frame.anchor.set(0.5);
    frame.position.set(app.screen.width / 2, app.screen.height / 2 - 120);
    frame.visible = false;
    app.stage.addChild(frame);
    loaderFrames.push(frame);
  }
  // Show loader animation at start
  let loaderIndex = 0;
  loaderFrames[loaderIndex].visible = true;
  let loaderElapsed = 0;
  let loaderActive = true;
  // Hide loader after 2 seconds
  setTimeout(() => {
    loaderActive = false;
    loaderFrames.forEach((f) => (f.visible = false));
  }, 2000);

  // --- Replace Play Button with custom red button styled like bet input ---
  function createRedButton(
    label: string,
    x: number,
    y: number,
    onClick: () => void,
  ) {
    const btn = new Container();
    // Red background with rounded corners and shadow
    const bgWidth = 160;
    const bgHeight = 48;
    const bg = new Graphics();
    // Shadow
    bg.beginFill(0x000000, 0.18);
    bg.drawRoundedRect(4, 4, bgWidth, bgHeight, 18);
    bg.endFill();
    // Main red fill
    bg.beginFill(0xd32f2f, 1); // Material red
    bg.drawRoundedRect(0, 0, bgWidth, bgHeight, 18);
    bg.endFill();
    btn.addChild(bg);
    // Button label
    const txt = new Text({
      text: label,
      style: new TextStyle({
        fontSize: 22,
        fill: "#fff",
        fontWeight: "bold",
        dropShadow: true,
        letterSpacing: 1.2,
      }),
    });
    txt.anchor.set(0.5);
    txt.position.set(bgWidth / 2, bgHeight / 2);
    btn.addChild(txt);
    btn.position.set(x, y);
    // Only handle visual hover/press here, sound is global
    btn.on("pointerover", () => {
      bg.tint = 0xff5252;
      btn.scale.set(1.08);
    });
    btn.on("pointerout", () => {
      bg.tint = 0xffffff;
      btn.scale.set(1);
    });
    btn.on("pointerdown", () => {
      btn.scale.set(0.95);
    });
    btn.on("pointerup", () => {
      btn.scale.set(1.08);
    });
    btn.on("pointerupoutside", () => {
      btn.scale.set(1);
    });
    btn.on("pointertap", onClick);
    addSoundToClickable(btn);
    app.stage.addChild(btn);
    return btn;
  }

  // --- Bet Input Area ---
  // Allowed bet steps
  const betSteps = [
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.4, 1.6, 1.8, 2, 3, 4,
    5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80,
    85, 90, 95, 100,
  ];
  for (let v = 125; v <= 1000; v += 25) betSteps.push(v / 1);
  let betIndex = betSteps.indexOf(1);
  let betValue = betSteps[betIndex];

  let betInput: Container;
  let betText: Text;
  function updateBetText() {
    betText.text = `$${betValue.toLocaleString(undefined, { minimumFractionDigits: betValue < 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
  }

  function createBetInput() {
    if (betInput) app.stage.removeChild(betInput);
    betInput = new Container();

    // --- Stylish Background ---
    const bg = new Graphics();
    const bgWidth = 300;
    const bgHeight = 60;
    bg.beginFill(0x1a2233, 0.98); // deep blue
    bg.drawRoundedRect(0, 0, bgWidth, bgHeight, 22);
    bg.endFill();
    // Subtle shadow
    bg.beginFill(0x000000, 0.18);
    bg.drawRoundedRect(6, 6, bgWidth, bgHeight, 22);
    bg.endFill();
    betInput.addChild(bg);

    // - button (modern look)
    const minusBtn = new Container();
    const minusBg = new Graphics();
    minusBg.beginFill(0x28324a, 1).drawRoundedRect(0, 0, 38, 38, 12).endFill();
    // Button shadow
    minusBg.beginFill(0x000000, 0.12);
    minusBg.drawRoundedRect(3, 3, 38, 38, 12);
    minusBg.endFill();
    minusBtn.addChild(minusBg);
    const minusTxt = new Text({
      text: "-",
      style: new TextStyle({ fontSize: 26, fill: "#fff", fontWeight: "bold" }),
    });
    minusTxt.anchor.set(0.5);
    minusTxt.position.set(19, 19);
    minusBtn.addChild(minusTxt);
    addSoundToClickable(minusBtn);
    minusBtn.on("pointertap", () => {
      if (betIndex > 0) {
        betIndex--;
        betValue = betSteps[betIndex];
        updateBetText();
      }
    });

    // Bet value text (modern style)
    betText = new Text({
      text: "",
      style: new TextStyle({
        fontSize: 30,
        fill: "#b0e0ff",
        fontWeight: "bold",
        dropShadow: true,
        letterSpacing: 1.5,
      }),
    });
    updateBetText();
    betText.anchor.set(0.5);

    // + button (modern look)
    const plusBtn = new Container();
    const plusBg = new Graphics();
    plusBg.beginFill(0x28324a, 1).drawRoundedRect(0, 0, 38, 38, 12).endFill();
    plusBg.beginFill(0x000000, 0.12);
    plusBg.drawRoundedRect(3, 3, 38, 38, 12);
    plusBg.endFill();
    plusBtn.addChild(plusBg);
    const plusTxt = new Text({
      text: "+",
      style: new TextStyle({ fontSize: 26, fill: "#fff", fontWeight: "bold" }),
    });
    plusTxt.anchor.set(0.5);
    plusTxt.position.set(19, 19);
    plusBtn.addChild(plusTxt);
    addSoundToClickable(plusBtn);
    plusBtn.on("pointertap", () => {
      if (betIndex < betSteps.length - 1) {
        betIndex++;
        betValue = betSteps[betIndex];
        updateBetText();
      }
    });

    // Layout: minus, bet, plus tightly together, centered in bg
    minusBtn.position.set(50, 11);
    betText.position.set(bgWidth / 2, bgHeight / 2);
    plusBtn.position.set(bgWidth - 50 - 38, 11);
    betInput.addChild(minusBtn);
    betInput.addChild(betText);
    betInput.addChild(plusBtn);

    // Position bet input centered above Play button and always center on resize
    function positionBetInput() {
      betInput.x = (app.screen.width - bgWidth) / 2;
      betInput.y = app.screen.height - bgHeight - 32;
    }
    positionBetInput();
    app.renderer.on("resize", positionBetInput);
    app.stage.addChild(betInput);
  }
  createBetInput();

  // --- UI State ---
  let balance = 1000;

  // --- UI: Balance Top Left ---
  const style = new TextStyle({ fontSize: 20, fill: "#fff" });
  const balanceText = new Text({ text: `Balance: $${balance}`, style });
  balanceText.anchor.set(0, 0);
  balanceText.position.set(20, 20);

  app.stage.addChild(balanceText);

  // --- Sound Toggle Button under Balance ---
  let soundEnabledState = sessionStorage.getItem("soundEnabled") === "1";
  const soundToggle = new Container();
  const toggleBg = new Graphics();
  const toggleWidth = 36;
  const toggleHeight = 36;
  function drawToggleBg() {
    toggleBg.clear();
    toggleBg.beginFill(soundEnabledState ? 0x4caf50 : 0xb71c1c, 0.95); // green if on, red if off
    toggleBg.drawRoundedRect(0, 0, toggleWidth, toggleHeight, 10);
    toggleBg.endFill();
  }
  drawToggleBg();
  soundToggle.addChild(toggleBg);
  // Icon
  const iconText = new Text({
    text: soundEnabledState ? "🔊" : "🔇",
    style: new TextStyle({ fontSize: 20, fill: "#fff" }),
  });
  iconText.anchor.set(0.5);
  iconText.position.set(toggleWidth / 2, toggleHeight / 2);
  soundToggle.addChild(iconText);
  // Make interactive
  addSoundToClickable(soundToggle);
  soundToggle.on("pointertap", () => {
    soundEnabledState = !soundEnabledState;
    sessionStorage.setItem("soundEnabled", soundEnabledState ? "1" : "0");
    iconText.text = soundEnabledState ? "🔊" : "🔇";
    drawToggleBg();
  });
  // Position under balance
  function positionSoundToggle() {
    soundToggle.x = 20;
    soundToggle.y = balanceText.y + balanceText.height + 8;
  }
  positionSoundToggle();
  app.stage.addChild(soundToggle);
  app.renderer.on("resize", positionSoundToggle);

  // --- UI: Info and Speaker Icons Top Right ---
  // Use SVG data URIs for icons for crisp scaling

  // Helper to create a stylized PixiJS button with icon
  function createPixiButton(yOffset: number, onClick: () => void): Container {
    const button = new Container();
    const icon = new Text({
      text: "i",
      style: new TextStyle({
        fontSize: 22,
        fill: "#fff",
        fontWeight: "bold",
        fontFamily: "Arial",
        align: "center",
      }),
    });
    // Responsive size
    function resizeButton() {
      // Force fixed size for the info button
      const size = 40;
      button.width = size;
      button.height = size;
      button.position.set(app.screen.width - size - 20, 20 + yOffset);
      icon.style.fontSize = size * 0.6;
      icon.anchor.set(0.5);
      icon.position.set(size / 2, size / 2);
      bg.clear();
      bg.beginFill(0x222a38, 0.95);
      bg.drawRoundedRect(0, 0, size, size, size * 0.25);
      bg.endFill();
      // Shadow
      bg.beginFill(0x000000, 0.15);
      bg.drawRoundedRect(4, 4, size, size, size * 0.25);
      bg.endFill();
    }
    // Background
    const bg = new Graphics();
    button.addChild(bg);
    button.addChild(icon);
    addSoundToClickable(button);
    // Hover effect
    button.on("pointerover", () => {
      bg.tint = 0x009aff;
      button.scale.set(1.08);
    });
    button.on("pointerout", () => {
      bg.tint = 0xffffff;
      button.scale.set(1);
    });
    button.on("pointertap", onClick);
    resizeButton();
    app.stage.addChild(button);
    app.renderer.on("resize", resizeButton);
    return button;
  }

  // Info button (only create if screen is large enough)
  if (window.innerWidth > 400 && window.innerHeight > 300) {
    createPixiButton(0, showInfoModal);
    // Dispatch a resize event to force correct rendering immediately
    window.dispatchEvent(new Event("resize"));
  }

  // --- Info Modal ---
  let infoModal: Container | null = null;
  function showInfoModal() {
    if (infoModal) return;
    infoModal = new Container();
    // Modal background (bigger)
    const modalWidth = app.screen.width * 0.92;
    const modalHeight = app.screen.height * 0.7;
    const bg = new Graphics();
    bg.beginFill(0x000000, 0.85);
    bg.drawRoundedRect(0, 0, modalWidth, modalHeight, 32);
    bg.endFill();
    infoModal.addChild(bg);
    // Scrollable text area
    const scrollArea = new Container();
    const scrollMask = new Graphics();
    scrollMask.beginFill(0xffffff);
    scrollMask.drawRoundedRect(0, 0, modalWidth - 60, modalHeight - 60, 16);
    scrollMask.endFill();
    scrollArea.mask = scrollMask;
    scrollArea.addChild(scrollMask);
    // Modal text
    const infoText = new Text({
      text:
        "Molly’s Cups 10X – Game Information\n\n" +
        "Game Overview\n" +
        "Molly’s Cups 10X is a simple yet exciting game of chance inspired by the classic ‘three cup’ street game. A prize is hidden under one of three cups, and the player’s objective is to pick the correct cup. If you choose correctly, you win 10X your bet. If not, the round results in 0X.\n\n" +
        "Game Rules\n" +
        "- Select your wager before the round begins.\n" +
        "- Three cups will be displayed on the screen, one hiding the prize.\n" +
        "- Choose one cup.\n" +
        "- The outcome is revealed instantly after your selection:\n" +
        "    - Correct pick: Win 10X your wager.\n" +
        "    - Incorrect pick: No win (0X).\n\n" +
        "Return to Player (RTP)\n" +
        "The long-term expected return to player (RTP) is 96%.\n" +
        "Individual game results may vary significantly from the stated RTP in the short term.\n\n" +
        "Important Disclosures\n" +
        "- This is a game of chance; there is no skill element.\n" +
        "- Visual shuffles, animations, or other effects shown on-screen are for entertainment purposes only and do not influence the server-determined outcome.\n" +
        "- The game server independently generates the result before the visual sequence is displayed.\n\n" +
        "Summary\n" +
        "Molly’s Cups 10X offers a straightforward and fast-paced experience: pick the right cup for a 10X win or lose your bet. With a fair RTP of 96%, the game balances excitement with transparency, delivering clear outcomes every round.",
      style: new TextStyle({
        fontSize: 22,
        fill: "#fff",
        wordWrap: true,
        wordWrapWidth: modalWidth - 80,
      }),
    });
    infoText.position.set(0, 0);
    scrollArea.addChild(infoText);
    scrollArea.position.set(40, 40);
    infoModal.addChild(scrollArea);
    scrollArea.addChild(scrollMask);
    // Scroll logic
    let scrollY = 0;
    const maxScroll = Math.max(0, infoText.height - (modalHeight - 60));
    scrollArea.interactive = true;
    scrollArea.eventMode = "static";
    scrollArea.on("wheel", (event: WheelEvent) => {
      scrollY -= event.deltaY;
      scrollY = Math.max(Math.min(scrollY, 0), -maxScroll);
      infoText.position.y = scrollY;
    });
    // Close button
    const closeBtn = new Text({
      text: "Close",
      style: new TextStyle({ fontSize: 20, fill: "#ffb", fontWeight: "bold" }),
    });
    closeBtn.interactive = true;
    closeBtn.cursor = "pointer";
    closeBtn.position.set(bg.width - 100, 20);
    closeBtn.on("pointertap", () => {
      app.stage.removeChild(infoModal!);
      infoModal = null;
    });
    infoModal.addChild(closeBtn);
    // Center modal
    infoModal.position.set(
      (app.screen.width - bg.width) / 2,
      (app.screen.height - bg.height) / 2,
    );
    app.stage.addChild(infoModal);
  }

  // Responsive: update icon positions and modal on resize
  app.renderer.on("resize", () => {
    balanceText.position.set(20, 20);
    if (infoModal) {
      infoModal.position.set(
        (app.screen.width - infoModal.width) / 2,
        (app.screen.height - infoModal.height) / 2,
      );
    }
  });

  function createButton(
    label: string,
    x: number,
    y: number,
    onClick: () => void,
  ) {
    // Use the new red button style
    return createRedButton(label, x, y, () => {
      if (sessionStorage.getItem("soundEnabled") === "1") {
        PIXI_SOUND.default.play("press");
      }
      onClick();
    });
  }

  // --- Helper for cup pick ---
  async function onCupPick() {
    // Simulate or implement cup pick UI logic here
    // For now, just a placeholder delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // --- Helper for rest state ---
  function onRest() {
    // Set game state to rest, update UI as needed
    // No round win display anymore
  }

  // --- Helper for balance update ---
  function onBalanceUpdate(endRoundResponse: { balance: { amount: number } }) {
    if (
      endRoundResponse &&
      endRoundResponse.balance &&
      typeof endRoundResponse.balance.amount === "number"
    ) {
      balance = endRoundResponse.balance.amount / 1000000;
    }
    balanceText.text = `Balance: $${balance}`;
  }

  // --- Mapping PlayResponse to helper format ---
  async function playApiCall(): Promise<{
    result: "win" | "loss";
    balance: { amount: number };
    round: { payoutMultiplier?: number };
  }> {
    const playResp = await rgs.getBookResponse();
    if (
      playResp &&
      playResp.balance &&
      typeof playResp.balance.amount === "number"
    ) {
      balance = playResp.balance.amount / 1000000;
    }
    // No round win display anymore
    // Map to expected structure
    return {
      result:
        playResp.round &&
          playResp.round.payoutMultiplier &&
          playResp.round.payoutMultiplier > 0
          ? "win"
          : "loss",
      balance: playResp.balance,
      round: playResp.round,
    };
  }

  // --- Mapping endRound to helper format ---
  async function endRoundApiCall(): Promise<{ balance: { amount: number } }> {
    await rgs.endRound();
    // Fallback to a default if null (should not happen if API is correct)
    return rgs.endRoundResponse || { balance: { amount: balance * 1000000 } };
  }

  async function handleAutomatedRound() {
    await handleGameRound({
      playApiCall,
      endRoundApiCall,
      onCupPick,
      onRest,
      onBalanceUpdate,
    });
  }

  // --- Add Buttons ---
  // Play button: always centered horizontally, clamped to 20% from the bottom
  const buttonWidth = 160;
  const buttonHeight = 48;
  const betInputBgHeight = 60;
  const betInputMarginBottom = 32;
  const playButtonMargin = 24; // space between play button and bet input
  let playButton: Container | null = null;
  function positionPlayButton() {
    if (playButton) {
      playButton.x = app.screen.width / 2 - buttonWidth / 2;
      playButton.y =
        app.screen.height -
        betInputBgHeight -
        betInputMarginBottom -
        buttonHeight -
        playButtonMargin;
    }
  }
  playButton = createButton(
    "Play",
    app.screen.width / 2 - buttonWidth / 2,
    // Y position will be set by positionPlayButton
    0,
    handleAutomatedRound,
  );
  positionPlayButton();
  app.renderer.on("resize", positionPlayButton);
  // Removed End Round button; all logic is now automated
  // Show End Round Response button is not needed visually, but you can add it back if you want

  // Animate engine and loader
  app.ticker.add((time) => {
    // Loader animation
    if (loaderActive) {
      loaderElapsed += time.deltaMS;
      if (loaderElapsed > 120) {
        loaderFrames[loaderIndex].visible = false;
        loaderIndex = (loaderIndex + 1) % loaderFrames.length;
        loaderFrames[loaderIndex].visible = true;
        loaderElapsed = 0;
      }
    }
  });
})();

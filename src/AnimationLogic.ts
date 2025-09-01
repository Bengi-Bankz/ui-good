import { Sprite, Container } from "pixi.js";
// AnimationLogic.ts
// Handles the animation sequence for the game round

export type AnimationStep = () => Promise<void>;

export class AnimationLogic {
    private steps: AnimationStep[] = [];

    addStep(step: AnimationStep) {
        this.steps.push(step);
    }

    async runSequence() {
        for (const step of this.steps) {
            await step();
        }
    }

    clear() {
        this.steps = [];
    }
}

// Holistic animation sequence for the three-cup game
// Usage: AnimationLogic.createCupGameSequence(cupSprites, prizeSprite, diamondSprite, onCupsClickable)
/**
 * Creates a realistic cup game animation sequence.
 * @param cupSprites Array of cup Sprite objects
 * @param prizeSprite Sprite for prize.png
 * @param diamondSprite Sprite for diamond.png
 * @param group Container holding the cups (for z-order)
 * @param onCupsClickable Callback when cups should become clickable
 */
export function createCupGameSequence(
    cupSprites: Sprite[],
    prizeSprite: Sprite,
    diamondSprite: Sprite,
    group: Container,
    onCupsClickable?: () => void,
) {
    const anim = new AnimationLogic();
    // Helper: Animate cup lift/reveal
    function liftCup(cup: Sprite, liftHeight = 80, duration = 220) {
        return new Promise<void>((resolve) => {
            const startY = cup.y;
            let t = 0;
            function animate() {
                t += 16;
                cup.y =
                    startY - liftHeight * Math.sin(Math.PI * Math.min(t / duration, 1));
                cup.zIndex = 10; // bring to front
                if (t < duration) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            animate();
        });
    }
    // Helper: Lower cup
    function lowerCup(cup: Sprite, liftHeight = 80, duration = 220) {
        return new Promise<void>((resolve) => {
            const startY = cup.y;
            let t = 0;
            function animate() {
                t += 16;
                cup.y =
                    startY + liftHeight * Math.sin(Math.PI * Math.min(t / duration, 1));
                cup.zIndex = 1; // restore z
                if (t < duration) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            animate();
        });
    }
    // Helper: Shuffle cups with z-order
    function shuffleCups(times = 3, duration = 220) {
        return new Promise<void>((resolve) => {
            let i = 0;
            const doShuffle = () => {
                if (i >= times) {
                    resolve();
                    return;
                }
                // Pick two random cups
                const idxA = Math.floor(Math.random() * cupSprites.length);
                let idxB = Math.floor(Math.random() * cupSprites.length);
                while (idxB === idxA)
                    idxB = Math.floor(Math.random() * cupSprites.length);
                const cupA = cupSprites[idxA];
                const cupB = cupSprites[idxB];
                // Animate swap
                const xA = cupA.x,
                    xB = cupB.x;
                let t = 0;
                function animate() {
                    t += 16;
                    const progress = Math.min(t / duration, 1);
                    // Move A above B for half the animation, then swap z
                    if (progress < 0.5) {
                        cupA.zIndex = 10;
                        cupB.zIndex = 1;
                    } else {
                        cupA.zIndex = 1;
                        cupB.zIndex = 10;
                    }
                    cupA.x = xA + (xB - xA) * progress;
                    cupB.x = xB + (xA - xB) * progress;
                    if (t < duration) {
                        requestAnimationFrame(animate);
                    } else {
                        cupA.x = xB;
                        cupB.x = xA;
                        // Swap in array for logical order
                        [cupSprites[idxA], cupSprites[idxB]] = [
                            cupSprites[idxB],
                            cupSprites[idxA],
                        ];
                        // Swap in container for visual order
                        group.setChildIndex(cupA, group.getChildIndex(cupB));
                        group.setChildIndex(cupB, group.getChildIndex(cupA));
                        i++;
                        setTimeout(doShuffle, 0);
                    }
                }
                animate();
            };
            doShuffle();
        });
    }
    // Step 1: Pick random cup, lift, reveal prize
    anim.addStep(async () => {
        const idx = Math.floor(Math.random() * cupSprites.length);
        const cup = cupSprites[idx];
        await liftCup(cup);
        prizeSprite.visible = true;
        prizeSprite.x = cup.x;
        prizeSprite.y = cup.y - cup.height * cup.scale.y;
        prizeSprite.zIndex = 5;
        group.setChildIndex(prizeSprite, group.getChildIndex(cup));
        await new Promise((r) => setTimeout(r, 500));
        await lowerCup(cup);
        prizeSprite.visible = false;
    });
    // Step 2: Shuffle cups 2-3 times
    anim.addStep(async () => {
        await shuffleCups(2 + Math.floor(Math.random() * 2));
    });
    // Step 3: Pick random cup, lift, reveal diamond
    anim.addStep(async () => {
        const idx = Math.floor(Math.random() * cupSprites.length);
        const cup = cupSprites[idx];
        await liftCup(cup);
        diamondSprite.visible = true;
        diamondSprite.x = cup.x;
        diamondSprite.y = cup.y - cup.height * cup.scale.y;
        diamondSprite.zIndex = 5;
        group.setChildIndex(diamondSprite, group.getChildIndex(cup));
        await new Promise((r) => setTimeout(r, 500));
        await lowerCup(cup);
        diamondSprite.visible = false;
    });
    // Step 4: Shuffle cups 4-5 times
    anim.addStep(async () => {
        await shuffleCups(4 + Math.floor(Math.random() * 2));
    });
    // Step 5: Make cups clickable
    anim.addStep(async () => {
        if (typeof onCupsClickable === "function") onCupsClickable();
    });
    return anim;
}

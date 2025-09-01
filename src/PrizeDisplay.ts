import { Container, Sprite, Graphics, Text, TextStyle } from "pixi.js";

export class PrizeDisplay extends Container {
    private prizeSprite: Sprite;
    private equalsGraphic: Graphics;
    private valueText: Text;

    constructor(prizeTexture: Sprite['texture'], value: number = 0, fontSize: number = 24) {
        super();
        // Prize image
        this.prizeSprite = new Sprite(prizeTexture);
        this.prizeSprite.anchor.set(0.5, 0.5);
        this.addChild(this.prizeSprite);

        // Equals sign
        this.equalsGraphic = new Graphics();
        this.equalsGraphic.beginFill(0xffffff, 1);
        this.equalsGraphic.drawRect(0, 0, fontSize, fontSize * 0.15);
        this.equalsGraphic.drawRect(0, fontSize * 0.35, fontSize, fontSize * 0.15);
        this.equalsGraphic.endFill();
        this.addChild(this.equalsGraphic);

        // Value text
        this.valueText = new Text({
            text: `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            style: new TextStyle({ fontSize, fill: "#ffd700", fontWeight: "bold" })
        });
        this.valueText.anchor.set(0, 0.5);
        this.addChild(this.valueText);

        this.layout(fontSize);
    }

    layout(fontSize: number = 24) {
        let x = 0;
        this.prizeSprite.width = fontSize;
        this.prizeSprite.height = fontSize;
        this.prizeSprite.x = x + fontSize / 2;
        this.prizeSprite.y = fontSize / 2;
        x += fontSize + 12;
        this.equalsGraphic.x = x;
        this.equalsGraphic.y = this.prizeSprite.y - fontSize * 0.25;
        x += fontSize + 12;
        this.valueText.x = x;
        this.valueText.y = this.prizeSprite.y;
    }

    setValue(value: number) {
        this.valueText.text = `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
}

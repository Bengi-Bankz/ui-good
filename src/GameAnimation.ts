import { Container } from "pixi.js";

export class GameAnimation extends Container {
    private state: string;

    constructor(initialState: string = "idle") {
        super();
        this.state = initialState;
    }

    getState(): string {
        return this.state;
    }

    setState(newState: string): void {
        this.state = newState;
        // You can add animation logic here based on state changes
    }

    reset(): void {
        this.state = "idle";
        // Reset animation visuals if needed
    }
}

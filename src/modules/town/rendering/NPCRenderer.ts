import { Container, Graphics } from 'pixi.js';

export class NPCRenderer {
    readonly container: Container;
    private body: Graphics;
    private shadow: Graphics;
    private accentColor: string;
    private frame = 0;
    private animTimer = 0;

    constructor(color: string) {
        this.accentColor = color;
        this.container = new Container();

        // Shadow
        this.shadow = new Graphics();
        this.shadow.ellipse(0, 8, 6, 3).fill({ color: '#000000', alpha: 0.2 });
        this.container.addChild(this.shadow);

        // Body
        this.body = new Graphics();
        this.container.addChild(this.body);

        this.drawFrame(0);
    }

    private drawFrame(frame: number): void {
        this.body.clear();
        const legOffset = frame === 1 ? 2 : frame === 2 ? -2 : 0;

        // Head
        this.body.circle(0, -12, 4).fill('#F5CBA7');

        // Body
        this.body.rect(-4, -7, 8, 10).fill('#1a1a2e');

        // Accent detail (scarf/belt)
        this.body.rect(-4, -4, 8, 2).fill(this.accentColor);

        // Legs
        this.body.rect(-3 + legOffset, 3, 2, 5).fill('#1a1a2e');
        this.body.rect(1 - legOffset, 3, 2, 5).fill('#2a2a3e');
    }

    update(moving: boolean): void {
        if (!moving) {
            // Idle bob
            this.animTimer++;
            this.body.y = Math.sin(this.animTimer * 0.05) * 0.5;
            return;
        }

        this.animTimer++;
        if (this.animTimer % 10 === 0) {
            this.frame = (this.frame + 1) % 3;
            this.drawFrame(this.frame);
        }
    }

    setPosition(x: number, y: number): void {
        this.container.x = x;
        this.container.y = y;
    }

    destroy(): void {
        this.container.destroy({ children: true });
    }
}

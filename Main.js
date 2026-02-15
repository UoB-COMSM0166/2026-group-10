import { EntityManager } from './src/EntityManager.js';
import { System } from './src/System.js';

let world;

new p5(p => {
    p.setup = () => {
        console.log("Setting up the world...");
        p.createCanvas(1280, 720).elt.addEventListener('contextmenu', e => e.preventDefault());
        world = new EntityManager();

        const player = world.createEntity();
        world.addComponent(player, 'position', { x: 400, y: 300 });
        world.addComponent(player, 'velocity', { vx: 0, vy: 0 });
        world.addComponent(player, 'appearance', { type: 'rect', color: [0, 150, 255], size: 30 });
        world.addComponent(player, 'input', true);

        console.log("Entity created with ID:", player);
    }

    p.draw = () => {
        p.background(30);
        System.playerControlSystem(p, world);
        System.navigationSystem(world);
        System.movementSystem(world);
        System.renderSystem(p, world);
        System.drawUI(p, world);
    }
});

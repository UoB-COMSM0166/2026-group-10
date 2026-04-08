import World, { Wave, Lane } from './World.js';
import { Zombie, Ghoul, Necromancer } from '../Entity/Unit/Enemy/Undead.js';

export default class Forest extends World {
    constructor() {
        super({
            name: 'Forest',
            size: { width: 1280, height: 720 },
            mode: 'Defense',
            heroPosition: { x: 420, y: 540 },
            objective: {
                position: { x: 320, y: 540 },
                hitbox: 30,
                hp: 1000
            },
            enemyTypes: {
                Zombie,
                Ghoul,
                Necromancer
            },
            waves: [
                new Wave(300, [
                    new Lane(
                        'A', 'Zombie', 180, 9,
                        [
                            { x: 800, y: 90 },
                            { x: 640, y: 180 },
                            { x: 640, y: 360 },
                            { x: 320, y: 540 }
                        ]
                    ),
                    new Lane(
                        'B', 'Ghoul', 240, 6,
                        [
                            { x: 1120, y: 450 },
                            { x: 640, y: 360 },
                            { x: 320, y: 540 }
                        ]
                    )
                ]),
                new Wave(120, [
                    new Lane(
                        'A', 'Ghoul', 240, 6,
                        [
                            { x: 800, y: 90 },
                            { x: 640, y: 180 },
                            { x: 640, y: 360 },
                            { x: 320, y: 540 }
                        ]
                    ),
                    new Lane(
                        'B', 'Necromancer', 300, 3,
                        [
                            { x: 1120, y: 450 },
                            { x: 640, y: 360 },
                            { x: 320, y: 540 }
                        ]
                    )
                ])
            ]
        });
    }
}

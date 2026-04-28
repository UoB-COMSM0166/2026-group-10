import World, { Wave, Lane } from './World.js';
import { Zombie, Boomer, Necromancer, Lich } from '../Entity/Unit/Enemy/Undead.js';

export default class Forest extends World {
    constructor() {
        super({
            name: 'Forest',
            size: { width: 1600, height: 900 },
            mode: 'Defense',
            heroPosition: { x: 400, y: 675 },
            objective: {
                position: { x: 250, y: 675 },
                hitbox: 50,
                hp: 500
            },
            enemyTypes: {
                Zombie,
                Boomer,
                Necromancer,
                Lich
            },
            waves: [
                new Wave(300, [
                    new Lane(
                        'A', 'Zombie', 180, 10,
                        [
                            { x: 1000, y: 112.5 },
                            { x: 944, y: 288 },
                            { x: 616, y: 360 },
                            { x: 250, y: 675 }
                        ]
                    ),
                    new Lane(
                        'B', 'Boomer', 240, 13,
                        [
                            { x: 1400, y: 562.5 },
                            { x: 1168, y: 460 },
                            { x: 944, y: 288 },
                            { x: 616, y: 360 },
                            { x: 250, y: 675 }
                        ]
                    )
                ]),
                new Wave(120, [
                    new Lane(
                        'A', 'Boomer', 240, 15,
                        [
                            { x: 1000, y: 112.5 },
                            { x: 944, y: 288 },
                            { x: 616, y: 360 },
                            { x: 250, y: 675 }
                        ]
                    ),
                    new Lane(
                        'B', 'Necromancer', 300, 16,
                        [
                            { x: 1400, y: 562.5 },
                            { x: 1168, y: 460 },
                            { x: 944, y: 288 },
                            { x: 616, y: 360 },
                            { x: 250, y: 675 }
                        ]
                    )
                ]),
                new Wave(180, [
                    new Lane(
                        'Boss', 'Lich', 1, 1,
                        [
                            { x: 1400, y: 450 },
                            { x: 800, y: 450 },
                            { x: 400, y: 675 }
                        ]
                    )
                ])
            ]
        });
    }
}

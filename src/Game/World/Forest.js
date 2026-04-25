import World, { Wave, Lane } from './World.js';
import { Zombie, Boomer, Necromancer } from '../Entity/Unit/Enemy/Undead.js';

export default class Forest extends World {
    constructor() {
        super({
            name: 'Forest',
            size: { width: 1600, height: 900 },
            mode: 'Defense',
            heroPosition: { x: 525, y: 675 },
            objective: {
                position: { x: 400, y: 675 },
                hitbox: 50,
                hp: 1000
            },
            enemyTypes: {
                Zombie,
                Ghoul: Boomer,
                Necromancer
            },
            waves: [
                new Wave(300, [
                    new Lane(
                        'A', 'Zombie', 180, 9,
                        [
                            { x: 1000, y: 112.5 },
                            { x: 800, y: 225 },
                            { x: 800, y: 450 },
                            { x: 400, y: 675 }
                        ]
                    ),
                    new Lane(
                        'B', 'Ghoul', 240, 6,
                        [
                            { x: 1400, y: 562.5 },
                            { x: 800, y: 450 },
                            { x: 400, y: 675 }
                        ]
                    )
                ]),
                new Wave(120, [
                    new Lane(
                        'A', 'Ghoul', 240, 6,
                        [
                            { x: 1000, y: 112.5 },
                            { x: 800, y: 225 },
                            { x: 800, y: 450 },
                            { x: 400, y: 675 }
                        ]
                    ),
                    new Lane(
                        'B', 'Necromancer', 300, 3,
                        [
                            { x: 1400, y: 562.5 },
                            { x: 800, y: 450 },
                            { x: 400, y: 675 }
                        ]
                    )
                ])
            ]
        });
    }
}

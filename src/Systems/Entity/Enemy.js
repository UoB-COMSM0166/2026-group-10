import Entity from './Entity.js';
import Movement from '../Movement.js';

export default class Enemy {
    static createEnemy(id, position, json, waypoints) {
        const enemy = new Entity(id, json.name, position);
        enemy.addComponent('hp', json.HP);
        enemy.addComponent('mp', json.MP);
        enemy.addComponent('speed', json.speed);
        enemy.addComponent('damage', json.damage);

        enemy.setComponent('position', position);
        enemy.setComponent('velocity', { vx: 0, vy: 0 });
        enemy.setComponent('waypoints', Array.isArray(waypoints) ? [...waypoints] : []);
        return enemy;
    }

    // TODO: 触发敌人死亡逻辑，比如赏金、经验、亡语效果等
    // TODO: This function will be called when the enemy's HP drops to 0 or below (bonus, experience, deathrattle effects, etc.)
    static die(enemy) {
    }
}
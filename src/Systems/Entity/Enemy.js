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
        // 保存敌人的后续目标点
        enemy.setComponent('waypoints', waypoints);
        // 当到达一个目标点后，移除它并导航到下一个目标点，直到没有目标点了就停下来。

        return enemy;
    }

    static moveAlongWaypoints(enemy, speed) {
        const waypoints = enemy.getComponent('waypoints');
        if (!waypoints || waypoints.length === 0) {
            // 没有目标点了，停下来
            enemy.setComponent('velocity', { vx: 0, vy: 0 });
            return;
        }
        
        const targetSpot = waypoints[0];
        Movement.navigateToSpot(enemy, targetSpot, speed);

        // 如果已经到达目标点了，就移除它
        const pos = enemy.getComponent('position');
        if (pos.x === targetSpot.x && pos.y === targetSpot.y) {
            waypoints.shift();
        }
    }

    static spawn

    // TODO: 触发敌人死亡逻辑，比如赏金、经验、亡语效果等
    // TODO: This function will be called when the enemy's HP drops to 0 or below (bonus, experience, deathrattle effects, etc.)
    static die(enemy) {
    }
}
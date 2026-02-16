export class Enemy {
    static createEnemy(id, position) {
        const enemy = new Entity(id);
        enemy.setComponent('position', position);
        enemy.setComponent('velocity', { vx: 0, vy: 0 });

        return enemy;
    }

    static initEnemyData(json, enemy) {
    }

    // 触发敌人死亡逻辑，比如赏金、经验、亡语效果等
    // This function will be called when the enemy's HP drops to 0 or below (bonus, experience, deathrattle effects, etc.)
    static die(enemy) {

    }
}
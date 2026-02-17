export class Enemy {
    static createEnemy(id, position) {
        const enemy = new Entity(id);
        enemy.setComponent('position', position);
        enemy.setComponent('velocity', { vx: 0, vy: 0 });

        return enemy;
    }

    // TODO: 初始化敌人数据，比如HP、攻击力、移动速度等
    // TODO: This function will be called when the enemy is created to initialize its data (HP, attack power, movement speed, etc.)
    static initEnemyData(json, enemy) {
    }

    // TODO: 触发敌人死亡逻辑，比如赏金、经验、亡语效果等
    // TODO: This function will be called when the enemy's HP drops to 0 or below (bonus, experience, deathrattle effects, etc.)
    static die(enemy) {
    }
}
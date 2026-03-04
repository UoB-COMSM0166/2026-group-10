# 技能系统快速参考

## 架构图

```
Game
  └─ SkillManager
       ├─ activeProjectiles[]    ← 管理所有弹道
       ├─ activeBuffs[]          ← 管理所有buff
       └─ update/render          ← 每帧更新

Unit (Hero/Enemy)
  └─ skills: { A, Q, W, E, R }  ← 单位的技能集

Skill
  ├─ 属性 (damage, cooldown, etc.)
  └─ canCast() / cast()

Projectile (extends Entity)
  ├─ 直线飞行模式
  └─ 追踪飞行模式
```

## 快速创建技能

### 1️⃣ 追踪弹道
```javascript
{
    type: "projectile",
    projectileHoming: true,    // 🎯 追踪
    projectileSpeed: 200,
    damage: 50
}
```

### 2️⃣ 直线弹道
```javascript
{
    type: "projectile",
    projectileHoming: false,   // ➡️ 直线
    projectileSpeed: 300,
    damage: 80
}
```

### 3️⃣ 自我增益
```javascript
{
    type: "buff",
    targeting: "self",         // 👤 自己
    duration: 5,
    statModifiers: { speed: 1.5 }
}
```

### 4️⃣ 范围伤害
```javascript
{
    type: "area",
    radius: 150,               // ⭕ 范围
    damage: 100
}
```

## 使用模式

### 按键触发技能
```javascript
// 按键处理
if (key === 'A') {
    const target = findNearestEnemy();
    skillManager.executeSkill(hero.skills.A, hero, target, null);
}

if (key === 'Q') {
    const pos = { x: mouseX, y: mouseY };
    skillManager.executeSkill(hero.skills.Q, hero, null, pos);
}

if (key === 'W') {
    skillManager.executeSkill(hero.skills.W, hero, null, null);
}
```

### 主循环集成
```javascript
function update(deltaTime) {
    // 1. 更新技能冷却
    for (const skill of Object.values(hero.skills)) {
        skill.updateCooldown(deltaTime);
    }
    
    // 2. 更新技能效果（弹道、buff等）
    skillManager.update(deltaTime);
}

function render(p5) {
    // 渲染技能视觉效果
    skillManager.render(p5);
}
```

## 技能属性速查

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | string | "projectile", "buff", "area", "instant" |
| `targeting` | string | "enemy", "self", "ally", "ground", "direction" |
| `manaCost` | number | 魔法消耗 |
| `cooldown` | number | 冷却时间（秒） |
| `damage` | number | 伤害值 |
| `range` | number | 施放距离 |
| `radius` | number | 弹道大小/范围半径 |
| `duration` | number | buff持续时间（秒） |
| `projectileSpeed` | number | 弹道速度 |
| `projectileHoming` | boolean | 是否追踪目标 |
| `projectileLifetime` | number | 弹道存在时间（秒） |
| `statModifiers` | object | 属性修改器 { stat: multiplier } |

## 扩展示例

### 多段跳跃的闪现技能
```javascript
const Blink = {
    name: "闪现",
    type: "instant",
    targeting: "ground",
    manaCost: 50,
    cooldown: 15,
    range: 300,
    effectData: {
        // 在SkillManager中自定义处理
        teleport: true
    }
};
```

### 持续伤害的毒雾
```javascript
const PoisonCloud = {
    name: "毒雾",
    type: "area",
    targeting: "ground",
    radius: 200,
    duration: 8,  // 持续8秒
    damage: 10,   // 每秒伤害
    effectData: {
        damagePerSecond: true,
        color: '#00FF00'
    }
};
```

### 群体治疗
```javascript
const GroupHeal = {
    name: "群体治疗",
    type: "area",
    targeting: "self",
    radius: 250,
    manaCost: 80,
    cooldown: 20,
    effectData: {
        heal: 100,
        targetAllies: true
    }
};
```

## 调试技巧

### 查看技能状态
```javascript
console.log(`${skill.name}:`);
console.log(`- Can cast: ${skill.canCast(hero)}`);
console.log(`- Cooldown: ${skill.currentCooldown}s`);
console.log(`- Mana cost: ${skill.manaCost}`);
console.log(`- Hero mana: ${hero.currentMP}/${hero.maxMP}`);
```

### 监控活跃效果
```javascript
console.log(`Active projectiles: ${skillManager.activeProjectiles.length}`);
console.log(`Active buffs: ${skillManager.activeBuffs.length}`);
```

### 可视化调试
```javascript
// 在render中显示弹道数量
p5.fill(255);
p5.text(
    `Projectiles: ${skillManager.activeProjectiles.length}`, 
    10, 20
);
```

## 常见问题

### Q: 技能无法施放？
A: 检查：
- 冷却时间是否结束 (`skill.currentCooldown === 0`)
- 魔法值是否足够 (`hero.currentMP >= skill.manaCost`)
- 目标是否有效

### Q: 弹道不追踪目标？
A: 确保：
- `projectileHoming: true`
- `executeSkill` 时传入了有效的 `target` 参数

### Q: buff不生效？
A: 确认：
- `statModifiers` 中的属性名与单位属性名匹配
- `skillManager.update()` 在主循环中被调用

### Q: 如何创建穿透弹道？
A: 在 `Projectile.onHit()` 中不设置 `this.hit = true`，或创建自定义 Projectile 子类。

## 文件列表

- `src/Entity/Void/Skill.js` - 技能基类
- `src/Entity/Projectile.js` - 弹道类
- `src/SkillManager.js` - 技能管理器
- `src/SkillConfigs.js` - 技能配置示例
- `src/Example_SkillUsage.js` - 完整使用示例
- `docs/SkillSystem.md` - 详细文档

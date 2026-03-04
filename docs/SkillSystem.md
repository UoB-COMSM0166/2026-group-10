# 技能系统设计文档

## 系统概述

这个技能系统支持多种类型的技能，包括弹道技能、增益技能、范围伤害技能等。系统采用模块化设计，易于扩展和维护。

## 核心类

### 1. Skill (技能类)
**位置**: `src/Entity/Void/Skill.js`

技能的基础类，存储技能的所有属性和行为。

**主要属性**:
- `type`: 技能类型 ("projectile", "buff", "area", "instant")
- `targeting`: 目标类型 ("enemy", "self", "ally", "ground", "direction")
- `manaCost`: 魔法消耗
- `cooldown`: 冷却时间
- `damage`: 伤害值
- `projectileSpeed`: 弹道速度
- `projectileHoming`: 是否追踪目标
- `statModifiers`: 属性修改器（用于buff）

**主要方法**:
- `canCast(caster)`: 检查是否可以施放
- `cast(caster, target, targetPosition)`: 施放技能
- `updateCooldown(deltaTime)`: 更新冷却时间

### 2. Projectile (弹道类)
**位置**: `src/Entity/Projectile.js`

继承自 Entity，表示游戏中的弹道对象。

**特性**:
- 支持直线飞行
- 支持追踪目标（homing）
- 自动碰撞检测
- 生命周期管理

**主要方法**:
- `update(deltaTime)`: 更新弹道位置和行为
- `checkCollision(unit)`: 检查与单位的碰撞
- `onHit(target)`: 处理击中目标
- `render(p5)`: 渲染弹道

### 3. SkillManager (技能管理器)
**位置**: `src/SkillManager.js`

管理所有技能的执行和效果。

**职责**:
- 执行技能并创建相应效果
- 管理活跃的弹道列表
- 管理活跃的buff/debuff
- 更新和渲染所有技能效果

**主要方法**:
- `executeSkill(skill, caster, target, targetPosition)`: 执行技能
- `createProjectile(effectData)`: 创建弹道
- `applyBuff(effectData)`: 应用buff
- `update(deltaTime)`: 更新所有效果
- `render(p5)`: 渲染所有视觉效果

## 技能类型

### 1. Projectile（弹道技能）

创建一个可以移动的弹道对象。

**子类型**:
- **直线弹道**: `projectileHoming: false`
  - 向指定方向直线飞行
  - 示例: Q技能 - 火球术
  
- **追踪弹道**: `projectileHoming: true`
  - 自动追踪目标
  - 示例: A技能 - 追踪导弹

**配置示例**:
```javascript
{
    type: "projectile",
    targeting: "enemy",
    projectileSpeed: 200,
    projectileHoming: true,  // 是否追踪
    projectileLifetime: 5,   // 存在时间（秒）
    damage: 50
}
```

### 2. Buff（增益/减益技能）

修改单位的属性，持续一段时间。

**特性**:
- 临时修改属性值
- 持续时间结束后自动恢复
- 支持多种属性修改

**配置示例**:
```javascript
{
    type: "buff",
    targeting: "self",
    duration: 5,  // 持续5秒
    statModifiers: {
        speed: 1.5,  // 速度提升50%
        damage: 1.2  // 伤害提升20%
    }
}
```

### 3. Area（范围伤害技能）

在指定区域造成伤害。

**配置示例**:
```javascript
{
    type: "area",
    targeting: "ground",
    radius: 150,  // 范围半径
    damage: 100
}
```

### 4. Instant（即时技能）

立即对目标造成效果。

**配置示例**:
```javascript
{
    type: "instant",
    targeting: "enemy",
    damage: 40
}
```

## 使用流程

### 1. 创建技能配置

在 `src/SkillConfigs.js` 中定义技能:

```javascript
export const MySkill = {
    name: "我的技能",
    description: "技能描述",
    type: "projectile",
    targeting: "enemy",
    manaCost: 30,
    cooldown: 5,
    damage: 50,
    projectileSpeed: 200,
    projectileHoming: false,
    effectData: {
        color: '#FF0000'
    }
};
```

### 2. 为单位添加技能

```javascript
import Skill from './Entity/Void/Skill.js';
import { MySkill } from './SkillConfigs.js';

// 创建技能实例
const skill = new Skill(MySkill);

// 添加到单位
hero.skills = {
    Q: skill
};
```

### 3. 施放技能

```javascript
// 需要目标的技能（追踪弹道）
skillManager.executeSkill(skill, hero, targetEnemy, null);

// 需要位置的技能（直线弹道）
skillManager.executeSkill(skill, hero, null, {x: 100, y: 100});

// 自我增益技能
skillManager.executeSkill(skill, hero, null, null);
```

### 4. 更新系统

在游戏主循环中:

```javascript
function update(deltaTime) {
    // 更新技能冷却
    for (const skill of Object.values(hero.skills)) {
        skill.updateCooldown(deltaTime);
    }
    
    // 更新技能效果
    skillManager.update(deltaTime);
}

function render(p5) {
    skillManager.render(p5);
}
```

## 示例：三种技能类型

### A技能 - 追踪导弹
```javascript
const HomingMissile = {
    name: "追踪导弹",
    type: "projectile",
    targeting: "enemy",
    projectileSpeed: 200,
    projectileHoming: true,  // 关键：启用追踪
    damage: 50
};
```

**使用**:
```javascript
const nearestEnemy = findNearestEnemy();
skillManager.executeSkill(aSkill, hero, nearestEnemy, null);
```

### Q技能 - 火球术
```javascript
const Fireball = {
    name: "火球术",
    type: "projectile",
    targeting: "direction",
    projectileSpeed: 300,
    projectileHoming: false,  // 关键：不追踪，直线飞行
    damage: 80
};
```

**使用**:
```javascript
const targetPos = {x: mouseX, y: mouseY};
skillManager.executeSkill(qSkill, hero, null, targetPos);
```

### W技能 - 加速
```javascript
const SpeedBoost = {
    name: "疾行",
    type: "buff",  // 关键：buff类型
    targeting: "self",
    duration: 5,
    statModifiers: {
        speed: 1.5  // 提升50%速度
    }
};
```

**使用**:
```javascript
skillManager.executeSkill(wSkill, hero, null, null);
```

## 扩展技能系统

### 添加新的技能类型

1. 在 `SkillManager.js` 的 `executeSkill` 方法中添加新的 case:
```javascript
case 'myNewType':
    this.handleMyNewType(effectData);
    break;
```

2. 实现处理方法:
```javascript
handleMyNewType(effectData) {
    // 实现新技能类型的逻辑
}
```

### 添加新的状态效果

在 `statModifiers` 中添加新的属性即可:
```javascript
statModifiers: {
    speed: 1.5,
    attackSpeed: 1.3,
    armor: 1.2,
    // ... 任何单位拥有的属性
}
```

### 自定义弹道行为

继承 `Projectile` 类并重写 `update` 方法:
```javascript
class CustomProjectile extends Projectile {
    update(deltaTime) {
        // 自定义移动逻辑
        // 例如：波浪形移动、螺旋移动等
        super.update(deltaTime);
    }
}
```

## 性能优化建议

1. **对象池**: 为频繁创建的弹道对象使用对象池
2. **空间分区**: 使用四叉树或网格优化碰撞检测
3. **批量渲染**: 将相同类型的弹道批量渲染
4. **限制数量**: 限制同时存在的弹道数量

## 总结

这个技能系统提供了：
- ✅ 灵活的技能类型（弹道、buff、范围、即时）
- ✅ 追踪和直线两种弹道模式
- ✅ 完整的buff系统
- ✅ 易于扩展的架构
- ✅ 清晰的使用示例

你可以根据游戏需求轻松添加新的技能类型和效果！

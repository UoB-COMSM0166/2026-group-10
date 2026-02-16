# Feature Priority

|Priority Rank - High to Low|System / Features|Time Taken|
|-|-|-|
|HIGHEST|Hero - Implement the stats screen funcitons of Hero system.|14%|
|HIGHER|Enemy - Design the emeny behavior.|13%|
|HIGH|Buff & Equip - Implement the Buff and Equipment functions, which effect the stats screen.|15%|
|MID|Skill - Design the skill tree. And implement the active skills with buff, projectile or target entity.|15%|
|LOW|Controll & Manager - Get the input from p5 libary and apply it to hero controll. Implement the game loop manager.|15%|
|LOWER|Turrent & UI - Design the turrent. And create a UI system.|14%|
|LOWEST|Boss - Design the Boss with active skills. Test the game.|14%|

# ECS
Entity Component System is the design paradigm. In this game, every moving things are entities, including hero, enemy, buff, projectile, turrent, boss, and the objective.

Each entity has some componets. When there are 500 fireballs and 200 zombies on the screen, the CPU only needs to process the IDs with position and velocity in a loop, without needing to know what they are, which greatly reduces memory fragmentation in JavaScript.

Entities with Componets are all effected by the Systems. In the game loop, we can just pick entities with some components then handle it.
```JavaScript
// 只处理同时拥有 Stats, Combat, Experience 的实体
// Only handle entities with Stats, Combat, and Experience components
const entities = world.query(['stats', 'combat', 'experience', 'primaryType']);
...
class World {
    query(componentNames) {
        return this.entities.filter(e => componentNames.every(name => e.hasOwnProperty(name)));
    }
}
```
 
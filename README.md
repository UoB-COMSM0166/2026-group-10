# 2026-group-10
2026 COMSM0166 group 10

# COMSM0166 Project Template
A project template for the Software Engineering Discipline and Practice module (COMSM0166).

## Info

This is the template for your group project repo/report. We'll be setting up your repo and assigning you to it after the group forming activity. You can delete this info section, but please keep the rest of the repo structure intact.

You will be developing your game using [P5.js](https://p5js.org) a javascript library that provides you will all the tools you need to make your game. However, we won't be teaching you javascript, this is a chance for you and your team to learn a (friendly) new language and framework quickly, something you will almost certainly have to do with your summer project and in future. There is a lot of documentation online, you can start with:

- [P5.js tutorials](https://p5js.org/tutorials/) 
- [Coding Train P5.js](https://thecodingtrain.com/tracks/code-programming-with-p5-js) course - go here for enthusiastic video tutorials from Dan Shiffman (recommended!)

<h2 align="center">GATES OF CINDER</h2>
---
STRAPLINE. Add an exciting one sentence description of your game here.

IMAGE. Add an image of your game here, keep this updated with a snapshot of your latest development.

LINK. Add a link here to your deployed game, you can also make the image above link to your game if you wish. Your game lives in the [/docs](/docs) folder, and is published using Github pages. 

VIDEO. Include a demo video of your game here (you don't have to wait until the end, you can insert a work in progress video)

## Development Team
----
### Team Photo 
![WhatsApp Image 2026-03-28 at 18 40 07](https://github.com/user-attachments/assets/c30621c0-e8ce-41dc-9768-56f7e3a1f887)
## Table of Contents

| #  | Section          | Description                                      |
|----|------------------|--------------------------------------------------|
| 00 | [Labs](#labs) | Weekly lab tasks & documentation                |
| 01 | [Introduction](#introduction) | Game overview & what makes it novel       |
| 02 | [Requirements](#requirements) | Ideation, use cases & user stories        |
| 03 | [Design](#design) | System architecture, state machine & class diagrams |
| 04 | [Implementation](#implementation) | Key technical challenges           |
| 05 | [Evaluation](#evaluation) | Qualitative & quantitative testing     |
| 06 | [Process](#process) | Team workflow & reflection               |
| 07 | [Conclusion](#conclusion) | Lessons learnt & future work         |
| 08 | [Contribution](#contribution) | Individual contributions         |



### Group Members 
-----

| Name                 | Email                 | Github Username       |
| -------------------- | --------------------- | --------------------- |
| Dhanitha Rajapaksa   | we25139@bristol.ac.uk | dhanitha-26           |       
| Cenarius Lu          | ig25518@bristol.ac.uk | Shadow-Song           |
| Rajmugundhan nagappan| je25549@bristol.ac.uk | Rajmugundhan2002-tech |
| Ayush Raizada        | ff25412@bristol.ac.uk | Raizada8              |
| James Crossley       | qe25280@bristol.ac.uk | jamescr1              |
| Jinhao Han           | bt25224@bristol.ac.uk | memoryzea             |


## 📚 Project Report

<h2 align="center">INTRODUCTION</h2>

---

<h2 align="center">GAME MECHANICS</h2>
The game mechanics draw from the energy of two famous games Like Kingdom Rush and League of Legends where the player must defend the objective using towers and use RPG elements.The player must choose  the correct towers and heroes to deal enemies effectively .The game is in a pixalted art style and the story takes place in a forest the defeat the final boss.

<table width="100%">
  <tr>
    <th align="center" width="50%">Kingdom Rush — Strategy tower defence</th>
    <th align="center" width="50%">League of Legends — RPG combat</th>
  </tr>
  <tr>
    <td align="center">
      <img src="kingdom rush.gif.gif" width="100%" height="250px" style="object-fit: cover;">
    </td>
    <td align="center">
      <img src="league-of-legends.gif" width="100%" height="250px" style="object-fit: cover;">
    </td>
  </tr>
</table>

---

### Requirements 

**Ideation Process** 

In the early stages of our project, we began by exploring what inspired us. Each team member brought one or two games to an in-person meeting, sharing what captivated them whilst considering the practical constraints of developing from scratch. After an initial round of ideas shared via our team group chat, we met to pitch specific inspirations. This resulted in a split between three very distinct genres: tower defence, RPG, and arcade. 

After analysing the strengths of each, the team identified a unique opportunity to create a hybrid mechanic. Rather than replicating existing titles, we decided to integrate the management strategy of _Kingdom Rush_ with the hero-centric mechanics of Diablo 2. Tower defence games offered proven engagement through strategic placement and resource management, whilst action RPGs provided the visceral satisfaction of character progression and skill-based combat.

With this direction established, we divided the research effort. Each team member investigated specific game rules, dynamics, and development challenges to ensure our hybrid concept remained feasible within our technical constraints and timeline. 

<h2 align="center">STAKE HOLDERS</h2>


##STAKE HOLDERS


<img width="1200" height="896" alt="chart" src="https://github.com/user-attachments/assets/89ad8717-d669-4e34-94fb-6b47acaf9330" />
<h2 align="center">EPICS AND USER STORIES</h2>
EPIC 1 – Core Defense Gameplay

Description: The player must defend the Ancient Tree from waves of undead enemies.

User Stories:
As a player, I want enemies to move toward the Ancient Tree, so that I must defend it.
As a player, I want enemies to damage the Ancient Tree on contact, so that there is a clear loss condition.
As a player, I want to attack enemies, so that I can stop them from reaching the tree.
Acceptance Criteria:
Enemies follow predefined paths toward the Ancient Tree.
Enemy collision with the tree reduces its health.
Player attacks register hits consistently and reduce enemy health.
Game ends when the Ancient Tree health reaches zero.

EPIC 2 – Enemy Waves & Boss System

Description: The game progresses through waves of enemies, culminating in powerful boss encounters.

User Stories:
As a player, I want enemies to spawn in waves, so that gameplay escalates over time.
As a player, I want a boss at the end of each round, so that I face a major challenge.
As a player, I want bosses to have unique attack patterns, so that combat feels varied.
As an Engineer player, I want bosses to target the Ancient Tree after destroying turrets, so that my gameplay has distinct risks.
Acceptance Criteria:
Waves spawn enemies at fixed intervals and locations.
Boss spawns after all minions in a wave are defeated.
Boss has multiple attack behaviors.
Boss targeting logic changes depending on player class.

EPIC 3 – Hero Class System

Description: Players choose and control unique hero classes with different mechanics.

User Stories:
As a player, I want to choose between Warrior, Mage, and Engineer, so that I can play different styles.
As a player, I want each class to have unique abilities, so that gameplay feels distinct.
Acceptance Criteria:
Player selects class before gameplay begins.
Each class has unique stats, abilities, and mechanics.
Class systems are independent and modular.

EPIC 4 – Warrior Mechanics

Description: The Warrior uses melee combat and rage-based abilities.

User Stories:
As a Warrior, I want different weapon types, so that my combat style changes.
As a Warrior, I want to generate rage through attacks, so that I can use powerful skills.
As a Warrior, I want rage to decay over time, so that I must stay aggressive.
As a Warrior, I want to upgrade equipment using gold, so that I become stronger.
Acceptance Criteria:
Weapons (longsword, rapier, battle axe) affect abilities.
Rage increases on attack and decreases over time.
Rage resets on death or respawn.
Equipment upgrades increase stats.

EPIC 5 – Mage Mechanics

Description: The Mage uses a flexible skill system powered by mana.

User Stories:
As a Mage, I want to combine Ice, Fire, and Lightning skills, so that I can customize my build.
As a Mage, I want mana to regenerate over time, so that I can continuously cast spells.
As a Mage, I want to spend gold on skills, so that I improve abilities instead of equipment.
Acceptance Criteria:
Skill combinations are selectable and usable in gameplay.
Mana regenerates over time and resets on respawn.
Skills consume mana when cast.
Gold is used for skill learning and upgrades only.

EPIC 6 – Engineer & Turret System

Description: The Engineer defends using turrets instead of a direct character.

User Stories:
As an Engineer, I want to place turrets, so that they automatically attack enemies.
As an Engineer, I want a limit on turret count, so that I must plan placement.
As an Engineer, I want to upgrade turrets using wood, so that they become stronger.
As an Engineer, I want permanent blueprint upgrades using gold, so that I progress over time.
Acceptance Criteria:
Turrets can be placed anywhere except restricted zones.
Total turret count is capped.
Wood is gained only from enemy kills.
Turrets attack enemies automatically.
Blueprint upgrades persist across gameplay.

EPIC 7 – Progression & Resources

Description: Players gain rewards and improve their abilities over time.

User Stories:
As a player, I want to gain experience from enemies, so that I can level up.
As a player, I want to earn gold, so that I can upgrade my character.
As a player, I want class-specific uses for gold, so that progression feels unique.
As an Engineer, I want to gain wood, so that I can build and upgrade turrets.
Acceptance Criteria:
XP is awarded on enemy defeat and triggers level-ups.
Level-ups grant skill points.
Gold is awarded consistently from enemies.
Resource usage differs per class.

EPIC 8 – Ancient Tree System

Description: The Ancient Tree acts as the core objective and life system.

User Stories:
As a player, I want the Ancient Tree to have health, so that I must protect it.
As a player, I want to repair the tree using gold, so that I can recover from damage.
As a player, I want the tree to revive me at a cost, so that death has consequences.
Acceptance Criteria:
Tree health decreases when enemies reach it.
Gold can be spent to restore tree health.
Player death triggers a respawn timer.
Tree health is reduced upon player revival.

EPIC 9 – Game States & Win/Lose Conditions

Description: The game clearly defines victory and defeat conditions.

User Stories:
As a player, I want to win after defeating all waves, so that I feel rewarded.
As a player, I want to lose when the tree is destroyed, so that failure is clear.
As a player, I want to respawn after death, so that I can continue playing.
Acceptance Criteria:
Game ends in victory when all enemies are defeated.
Game ends in defeat when tree health reaches zero.
Respawn system includes a timer and penalty.
UI clearly communicates game state changes.

EPIC 10 – Technical Architecture & Scalability

Description: The system is modular and maintainable for future expansion.

User Stories:
As a developer, I want modular systems, so that features are easy to maintain.
As a developer, I want class systems separated, so that balancing is easier.
As a developer, I want scalable enemy and wave systems, so that new content can be added easily.
Acceptance Criteria:
Systems separated (Combat, AI, Resources, UI, Classes).
Clear update loop and system interactions.
Data-driven configs for enemies, waves, and abilities.
New classes or enemies can be added without rewriting core systems.

<details>
  <summary><strong>Game ideas and analysis</strong></summary>

| Game                    | Game Description                                                                                                                                                                                                                                                                                                                              | Twist Potential                                                                                                                                                                                                                      | Implementation Challenges                                                                                                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Super Mario**         | Classic side-scrolling platformer where players jump on enemies, collect coins and power-ups, and reach the end flag.                                                                                                                                                                                                                         | • Power-ups transform Mario into different forms with unique abilities <br>• Hidden blocks, warp zones, and secret areas <br>• Progressive level design that teaches mechanics through gameplay                                      | • Collision detection and sprite management <br>• Jump physics consistency <br>• Level design iteration and pacing <br>• Differentiation from generic platformer                                              |
| **Smashy Road: Wanted** | Top-down driving game where players escape police by hijacking new vehicles when destroyed. The longer you survive, the more aggressive the pursuit becomes.                                                                                                                                                                                  | • Wanted level escalates from police to SWAT to tanks to helicopters <br>• Vehicle types with different speed and durability stats <br>• Safe zones where wanted level decreases if player hides                                     | • Adaptive AI pathfinding with escalating aggression <br>• Vehicle collision physics and damage system <br>• Map generation with obstacles <br>• Smooth hijacking transitions                                 |
| **Airplane Survival**   | Top-down plane game where players steer to dodge homing missiles. Survive longer to unlock faster planes and earn higher scores.                                                                                                                                                                                                              | • Missiles with different behaviours like fast, slow, or cluster splits <br>• Bonus points for making missiles collide <br>• Terrain obstacles that block missiles <br>• Unlockable planes with different speeds                     | • Missile homing AI balancing difficulty <br>• Collision detection for missile interactions <br>• Score-based unlock progression <br>• Visual and audio feedback systems                                      |
| **Tank Trouble**        | Top-down maze combat where players fire bouncing shells to destroy opponents while avoiding their own ricochets.                                                                                                                                                                                                                              | • Maze walls regenerate on timers forcing position changes <br>• Arena shrinks over time for closer combat <br>• Energy system where firing consumes regenerating resource <br>• Directional shields and terrain effects             | • Bounce physics for shell reflections <br>• Safe maze regeneration without trapping players <br>• Multiplayer input handling <br>• Wall regeneration preview system                                          |
| **Kingdom Rush**        | Kingdom Rush is a fixed-path tower defence game where players strategically place and upgrade towers along enemy routes to survive waves. What makes it interesting is the tower upgrade tree system where each tower branches into specialised forms, plus the addition of a player-controlled hero unit that adds an active tactical layer. | • Towers branch into specialised upgrade paths <br>• Combine adjacent towers into hybrid forms <br>• Enemies evolve if they survive too long <br>• Player-controlled hero unit with abilities                                        | • Enemy pathfinding along set routes <br>• Tower upgrade tree logic and UI <br>• Wave spawning with difficulty scaling <br>• Balance across multiple tower types                                              |
| **Frogger**             | Frogger is a classic grid-based navigation game where players guide frogs across roads with moving cars and rivers with moving logs to reach lily pads safely. The game's appeal lies in its simple timing-based challenge and clear visual feedback on the grid.                                                                             | • Frog evolution system unlocking new forms with abilities <br>• Dynamic lanes that speed up, reverse, or spawn safe zones <br>• Competitive multiplayer with coin collection <br>• Extended maps with complex obstacle patterns     | • Grid-based movement and timing <br>• Pattern synchronisation for moving obstacles <br>• Lane speed variation and balancing <br>• Precise collision detection                                                |
| **Crossy Road**         | Endless arcade hopper where players navigate freeways, railways, and rivers whilst avoiding cars and collecting custom characters.                                                                                                                                                                                                            | • Player moves forward in direction cars are travelling <br>• Adaptive environment transitions between road types <br>• Character unlocks with different abilities <br>• Procedurally generated obstacles with increasing complexity | • Designing varied objects within frontend constraints <br>• Programming mechanics for multiple object types <br>• Generating adaptive environments with smooth transitions <br>• Obstacle difficulty scaling |
| **Pong**                | Pong is one of the earliest arcade games where two players control paddles to deflect a ball back and forth.                                                                                                                                                                                                                                  | • Ball modifiers like splits, gravity changes, or curve or spin <br>• Paddle upgrade options, sizes, shapes, or abilities <br>• Environmental hazards like moving obstacles or portal zones                                             | • Ball physics with consistent bounce angles <br>• Paddle collision detection and response <br>• AI opponent balancing for single-player                                                                    |
| **Breakout**            | Breakout is a single-player brick-breaking game where players control a paddle to bounce a ball upwards to destroy rows of bricks.                                                                                                                                                                                                            | • Brick types requiring multiple hits or special conditions <br>• Power-ups dropped from destroyed bricks <br>• Dynamic brick layouts that move or regenerate                                                                      | • Ball physics and angle calculations <br>• Brick collision detection and destruction                                                                                                                        |

</details>

**Early Stage Design**

By Week 3, we had translated these ideas into a paper prototype during the workshop. Testing sessions were positive, particularly regarding the different player roles we designed. With the fundamental mechanics validated, we moved forward to develop sprites and assets for digital prototyping, which would allow us to test the gameplay loop more thoroughly.

**Epics and User stories: **
Through the process of creating epics, user stories and acceptance requirements, we obtained a greater awareness of the range of stakeholders our game has. We also developed a deeper understanding of the context that our game exists in.

By creating epics, we learned of the different sub-categories of users our game may have, such as users with visual impairments and users with other disabilities. An increased awareness of the importance of the different categories of developers involved in the game, such as ‘front-end developers’ and ‘back-end developers’ was also acquired.

Creating user stories permitted us to obtain a better insight into the perspective of the user of our game and what features they might value in our game. As a result of this process, a greater appreciation of the reasons why users might highly value certain features of the game, such as a dynamic strategic combat system or progressive map experience, was developed.

The process of producing acceptance criteria helped to give precise, actionable data to the team with regards to how a specific feature, or aspect of the game, should be implemented. Generating acceptance criteria also provided the team with measurable criteria against which we could measure the success of our sprints and general game development.

By considering the plethora of stakeholders around our game, we gained a better understanding of the diverse range of people who may have interests in our game and the importance of considering these people when making decisions regarding the development of our game.


**Prototyping** 
Gates of cinder paper prototype


<table width="100%">
  <!-- ROW 1 -->
  <tr>
    <td width="50%">
      <img src="frogger.gif" width="100%" height="250px" style="object-fit: cover;">
    </td>
    <td width="50%">
      <h3>Prototype — description</h3>
      <p>
       description
      </p>
    </td>
  </tr>

  <!-- ROW 2 -->
  <tr>
    <td width="50%">
      <img src="gates of cinder proto.gif" width="100%" height="250px" style="object-fit: cover;">
    </td>
    <td width="50%">
      <h3>the start menu can be viewed,choosing difficulty levels and hero mechanics.After that the towers are choosen to protect the objective.</h3>
      <p>
        description
      </p>
    </td>
  </tr>
</table>
**Testing Feedback** 

- 15% ~750 words
- Early stages design. Ideation process. How did you decide as a team what to develop? Use case diagrams, user stories. 

### Design

- 15% ~750 words 
- System architecture. Class diagrams, behavioural diagrams. 

### Implementation

- 15% ~750 words

- Describe implementation of your game, in particular highlighting the TWO areas of *technical challenge* in developing your game. 

### Evaluation

- 15% ~750 words

- One qualitative evaluation (of your choice) 

- One quantitative evaluation (of your choice) 

- Description of how code was tested. 

### Process 

- 15% ~750 words

- Teamwork. How did you work together, what tools and methods did you use? Did you define team roles? Reflection on how you worked together. Be honest, we want to hear about what didn't work as well as what did work, and importantly how your team adapted throughout the project.

### Conclusion

- 10% ~500 words

- Reflect on the project as a whole. Lessons learnt. Reflect on challenges. Future work, describe both immediate next steps for your current game and also what you would potentially do if you had chance to develop a sequel.

### Contribution Statement

- Provide a table of everyone's contribution, which *may* be used to weight individual grades. We expect that the contribution will be split evenly across team-members in most cases. Please let us know as soon as possible if there are any issues with teamwork as soon as they are apparent and we will do our best to help your team work harmoniously together.

### Additional Marks

You can delete this section in your own repo, it's just here for information. in addition to the marks above, we will be marking you on the following two points:

- **Quality** of report writing, presentation, use of figures and visual material (5% of report grade) 
  - Please write in a clear concise manner suitable for an interested layperson. Write as if this repo was publicly available.
- **Documentation** of code (5% of report grade)
  - Organise your code so that it could easily be picked up by another team in the future and developed further.
  - Is your repo clearly organised? Is code well commented throughout?

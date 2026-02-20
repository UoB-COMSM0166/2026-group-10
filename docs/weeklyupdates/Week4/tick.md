# Addon

## Tick
This game is set to run in tick. In each tick the `GameManager` will calculate the status and movement of each entities. We set the tick rate is 60Hz, which means the tick will update 60 times per second. And the graph is also set to update 60 frames per second. 

So in json files, each value related to time, such as cooldown and duration, is counted in tick. In `./data/Map/Forest.json` file, value `waves[i].start_tick` and `waves[i].spawns[j].spawn_cd` are counted in tick.

`GameManager` have an attribute `this.clock`, which is a `GameClock` objective. `GameClock.now()` returns the the current tick.

## JSON
All customizable elements should be stored to json files, such as hero, skill and map.

### Map
> Go to check `./data/Map/Forest.json`.
It defines the location of objective, hero and enemy spawns.

Additionally, it defines the path information. The `way_points` array stores the destination series of enemies. After a enemy reaches a way point, it will move to the next one, until it reaches the last one (the objective) or be killed.

Enemy infomations are included in map json.

## UI

It will show a timer and a tick counter in the left-top cornor, with calculated FPS and TPS.

Additionally, UI will show all waypotins of hero.

# Edited

## Movement

Now each entity have an array componet `waypoints`, which stores the movement series of it. For hero, the controller now support **shift + right click** mode. Hold shift and right click will append a waypoint to `hero.componets.waypoints`, and hero will follow it. And single right click will also clear the array and put the new waypoint in it.
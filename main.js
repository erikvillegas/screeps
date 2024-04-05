function spawnCreep(spawn) {
  const creeps = Object.values(Game.creeps);

  if (creeps.length < 6) {
    const name = "Creep" + Game.time.toString();
    spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], name);
  }
}

function assignSource(creep, room) {
  if (!creep.memory.source) {
    const creeps = Object.values(Game.creeps);
    const sources = room.find(FIND_SOURCES);

    const creepsUsingPrimarySource = creeps
      .map((c) => c.memory.source)
      .filter((id) => id === room.memory.sources.primary);
    creep.memory.source =
      creepsUsingPrimarySource < 4
        ? room.memory.sources.primary
        : room.memory.sources.secondary;
  }
}

function manageCreeps(creeps, room) {
  for (var name in creeps) {
    var creep = creeps[name];
    // creep.say("Noobie!!", true);

    var doneUpgrading = creep.memory["doneUpgrading"];

    if (doneUpgrading === true || doneUpgrading === undefined) {
      assignSource(creep, room);

      // const source = Game.getObjectById(creep.memory.source)
      const source = Game.getObjectById("5bbcae399099fc012e638988");

      creep.moveTo(source);
      creep.harvest(source);

      if (creep.store[RESOURCE_ENERGY] == 50) {
        creep.memory["doneUpgrading"] = false;
      }
    } else {
      var controller = creep.room.controller;
      creep.moveTo(controller);
      creep.upgradeController(controller);

      if (creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory["doneUpgrading"] = true;
        creep.memory.source = undefined;
      }
    }
  }
}

function initialize() {
  // TODO: reset
  Memory.initialized = false;

  if (!Memory.initialized) {
    console.log("Initializing...");

    const rooms = Object.values(Game.rooms);

    // Arrange the sources
    rooms.forEach((room) => {
      const controller = room.controller;
      const sources = room.find(FIND_SOURCES);
      let sourceControllerSteps = sources.map((source) => {
        const path = room.findPath(source.pos, controller.pos, {
          ignoreCreeps: true,
          ignoreDestructibleStructures: true,
        });
        return { source, distance: path.length };
      });

      sourceControllerSteps.sort((a, b) => a.distance - b.distance);

      room.memory.sources = {
        primary: sourceControllerSteps[0]
          ? sourceControllerSteps[0].source.id
          : undefined,
        secondary: sourceControllerSteps[1]
          ? sourceControllerSteps[1].source.id
          : undefined,
        tertiary: sourceControllerSteps[2]
          ? sourceControllerSteps[2].source.id
          : undefined,
      };

      console.log(
        `room.memory.sources: ${JSON.stringify(room.memory.sources, null, 4)}`
      );

      // console.log(`sourceToControllerSteps: ${JSON.stringify(sourceToControllerSteps, null, 4)}`);

      // Find the appropriate source to use

      // console.log(`sourceToControllerPaths: ${JSON.stringify(sourceToControllerPaths, null, 4)}`);
    });

    Memory.initialized = true;
  }
}

module.exports.loop = function () {
  initialize();

  const spawn = Game.spawns["S1"];
  const room = spawn.room;
  const creeps = Object.values(Game.creeps);

  console.log("tick " + Game.time.toString());

  spawnCreep(spawn);
  manageCreeps(creeps, room);
};

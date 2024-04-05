/*
  Areas of optimization:
  - Optimize resource utilization between all harvesting creeps

*/

function spawnCreep(spawn) {
  const creeps = Object.values(Game.creeps);

  if (creeps.length < 6) {
    const name = "Creep" + Game.time.toString();
    spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], name);
  }
}

function assignSource(creep, room) {
  if (!creep.memory.source) {
    creep.memory.source = room.memory.sources[0];
  }
}

function manageCreeps(creeps, room) {
  for (var name in creeps) {
    var creep = creeps[name];
    // creep.say("Noobie!!", true);

    var doneUpgrading = creep.memory["doneUpgrading"];

    if (doneUpgrading === true || doneUpgrading === undefined) {
      assignSource(creep, room);

      const source = Game.getObjectById(creep.memory.source);

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

function initializeRooms() {
  const rooms = Object.values(Game.rooms);

  rooms
    .filter((room) => !room.memory.initialized)
    .forEach((room) => {
      console.log(`Initializing room ${room.name}`);

      // Arrange the sources by distance to controller
      const controller = room.controller;
      const sources = room.find(FIND_SOURCES);
      let sourceControllerSteps = sources.map((source) => {
        const path = room.findPath(source.pos, controller.pos, {
          ignoreCreeps: true,
          ignoreDestructibleStructures: true,
        });
        return { source, distance: path.length };
      });

      room.memory.sources = sourceControllerSteps
        .sort((a, b) => a.distance - b.distance)
        .map((s) => s.source.id);

      room.memory.initialized = true;
    });

  // check if any rooms have reached level 2
  rooms
    .filter(
      (room) => !room.memory.initializedLevel2 && room.controller.level >= 2
    )
    .forEach((room) => initializeRoomLevel2(room));
}

function initializeRoomLevel2(room) {
  console.log(`Initializing room ${room.name} for level 2`);
  room.memory.initializedLevel2 = true;
}

module.exports.loop = function () {
  initializeRooms();

  const spawn = Game.spawns["S1"];
  const room = spawn.room;
  const creeps = Object.values(Game.creeps);

  console.log("tick " + Game.time.toString());

  spawnCreep(spawn);
  manageCreeps(creeps, room);
};

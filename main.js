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

  // check if any rooms have reached a new level
  rooms
    .filter((room) => !room.memory.initializedLevel0 && room.controller.level >= 0)
    .forEach((room) => {
      initializeRoomLevel0(room);
      room.memory.initializedLevel0 = true;
    });

  rooms
    .filter((room) => !room.memory.initializedLevel1 && room.controller.level >= 1)
    .forEach((room) => {
      initializeRoomLevel1(room);
      room.memory.initializedLevel1 = true;
    });

  rooms
    .filter((room) => !room.memory.initializedLevel2 && room.controller.level >= 2)
    .forEach((room) => {
      initializeRoomLevel2(room);
      // room.memory.initializedLevel2 = true;
    });

  rooms
    .filter((room) => !room.memory.initializedLevel3 && room.controller.level >= 3)
    .forEach((room) => {
      initializeRoomLevel3(room);
      room.memory.initializedLevel3 = true;
    });

  rooms
    .filter((room) => !room.memory.initializedLevel4 && room.controller.level >= 4)
    .forEach((room) => {
      initializeRoomLevel4(room);
      room.memory.initializedLevel4 = true;
    });

  rooms
    .filter((room) => !room.memory.initializedLevel5 && room.controller.level >= 5)
    .forEach((room) => {
      initializeRoomLevel5(room);
      room.memory.initializedLevel5 = true;
    });
}

function initializeRoomLevel0(room) {
  console.log(`Initializing room ${room.name} for level 0`);
  // Available (Roads, 5 Containers)

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
}

function initializeRoomLevel1(room) {
  console.log(`Initializing room ${room.name} for level 1`);
  // Available Roads, Containers (5)
}

function initializeRoomLevel2(room) {
  console.log(`Initializing room ${room.name} for level 2`);
  // Available: Extensions (5 @ 50 capacity), Ramparts (300K max hits), Walls
  room.controller.activateSafeMode();

  // Build construction sites for 4 extensions at Base1 site
  const baseFlag1 = room.find(FIND_FLAGS).find((f) => f.name === "Base1");
  console.log(`baseFlag1: ${JSON.stringify(baseFlag1, null, 4)}`);

  // Main loop: If construction site available, spawn constructor
}

function initializeRoomLevel3(room) {
  console.log(`Initializing room ${room.name} for level 3`);
  // Available: Extensions (10 @ 50 capacity), Ramparts (1M max hits), Towers (1)
  room.controller.activateSafeMode();

  // Build construction site for 1 tower near spawn

  // Main loop: If construction site available, spawn constructor
}

function initializeRoomLevel4(room) {
  console.log(`Initializing room ${room.name} for level 4`);
  // Available: Extensions (20 @ 50 capacity), Ramparts (3M max hits), Towers (1), Storage
  room.controller.activateSafeMode();
}

function initializeRoomLevel5(room) {
  console.log(`Initializing room ${room.name} for level 5`);
  // Available: Extensions (30 @ 50 capacity), Ramparts (10M max hits), Towers (2) Links (2)
  room.controller.activateSafeMode();
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

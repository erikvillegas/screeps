const ROLE_ASSISTANT = "assistant";
const ROLE_BUILDER = "builder";
const ROLE_REPAIRER = "repairer";
const ROLE_UPGRADER = "upgrader";
const ROLE_ATTACKER = "attacker";
const ROLE_REMOTE_BUILDER = "remote-builder";
const ROLE_HARVESTER = "harvester";
const ROLE_TOWER_ASSISTANT = "tower";
const ROLE_LINK_ASSISTANT = "link";

const STORAGE_ID = "577aeac6286d82787cfdeb22";

const MAIN_ROOM = "E12N31";
const LEFT_ROOM = "E11N31";

const ERR_TARGET_NOT_IN_ROOM = -12345;

var config = {
  minimumCreepSize: 300,
  requiredAssistants: 2,
  requiredBuilders: 0,
  requiredRepairers: 0,
  requiredRemoteBuilders: 0,
  requiredUpgraders: 4,
  requiredTowerAssistants: 1,
  requiredHarvesters: 2,
  requiredLinkAssistants: 0,
};

var workerRole = require("role.worker");
var courierRole = require("role.courier");
var heavyRole = require("role.heavy");
var attackerRole = require("role.attacker");

module.exports.loop = function () {
  // spawn any new creeps if necessary

  // perform creep actions
  _.forOwn(Game.creeps, function (creep, name) {
    if (creep.memory.role == "worker") {
      workerRole.run(creep);
    } else if (creep.memory.role == "courier") {
      courierRole.run(creep);
    } else if (creep.memory.role == "heavy") {
      heavyRole.run(creep);
    } else if (creep.memory.role == "attacker") {
      attackerRole.run(creep);
    }
  });
};

module.exports.loopOLD = function () {
  // printer helper function
  Game.p = function (obj) {
    console.log(obj);
  };
  Game.pp = function (obj) {
    return JSON.stringify(obj, null, 4);
  };

  clearOldMemory();

  // current room elements
  var room = Game.rooms["E12N31"];
  var spawn = Game.spawns["S"];
  var controller = room.controller;
  var leftSource = Game.getObjectById("576a9c4d57110ab231d88d5e");
  var rightSource = Game.getObjectById("576a9c4d57110ab231d88d5d");
  var leftRoomBottomSource = Game.getObjectById("576a9c4b57110ab231d88d1d");
  var leftRoomTopSource = Game.getObjectById("576a9c4b57110ab231d88d1c");
  var towers = [
    Game.getObjectById("5778b2bae93ccfd46c582ad6"),
    Game.getObjectById("577f1a6dc788bd1253e53604"),
  ];
  var storage = Game.getObjectById(STORAGE_ID);
  var leftLink = Game.getObjectById("577fcb2f7c53468a1e610817");
  var rightLink = Game.getObjectById("577fe0545562737e6b4f5c54");

  // flags
  var vacationFlag = Game.flags["Vacation"];
  var vacationFlag2 = Game.flags["Vacation2"];
  var exitFlag = Game.flags["Exit"];

  // structures for creeps
  var energyStructureTypes = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
  ];
  var orderedEnergyStorages = _.filter(
    room.find(FIND_STRUCTURES),
    function (s) {
      var isStorage = _.includes(energyStructureTypes, s.structureType);
      return isStorage && s.energy < s.energyCapacity;
    }
  ).sort(function (s1, s2) {
    return (
      energyStructureTypes.indexOf(s1.structureType) -
      energyStructureTypes.indexOf(s2.structureType)
    );
  });

  var constructionSiteTypes = [
    STRUCTURE_TOWER,
    STRUCTURE_ROAD,
    STRUCTURE_EXTENSION,
    STRUCTURE_WALL,
    STRUCTURE_RAMPART,
    STRUCTURE_CONTAINER,
    STRUCTURE_STORAGE,
    STRUCTURE_LINK,
  ];
  var orderedConstrutionSites = _.filter(
    room.find(FIND_CONSTRUCTION_SITES),
    function (s) {
      return true; //(_.includes(constructionSiteTypes, s.structureType))
    }
  ).sort(function (s1, s2) {
    return (
      constructionSiteTypes.indexOf(s1.structureType) -
      constructionSiteTypes.indexOf(s2.structureType)
    );
  });

  var repairSiteTypes = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_ROAD,
    STRUCTURE_RAMPART,
    STRUCTURE_WALL,
    STRUCTURE_TOWER,
    STRUCTURE_CONTAINER,
    STRUCTURE_STORAGE,
  ];
  var orderedRepairSites = _.filter(room.find(FIND_STRUCTURES), function (s) {
    if (s.progress == null) {
      if (s.structureType == STRUCTURE_WALL) {
        return s.hits / s.hitsMax < 4000000.0 / 300000000.0;
      } else if (s.structureType == STRUCTURE_RAMPART) {
        return s.hits / s.hitsMax < 4000000.0 / 30000000.0;
      } else {
        return s.hits / s.hitsMax < 1;
      }
    }
    return false;
  })
    .sort(function (s1, s2) {
      return (
        repairSiteTypes.indexOf(s1.structureType) -
        repairSiteTypes.indexOf(s2.structureType)
      );
    })
    .sort(function (s1, s2) {
      if (
        s1.structureType == STRUCTURE_WALL ||
        s1.structureType == STRUCTURE_RAMPART
      ) {
        // return 1
        return (
          repairSiteTypes.indexOf(s1.structureType) -
          repairSiteTypes.indexOf(s2.structureType)
        );
      } else if (
        s2.structureType == STRUCTURE_WALL ||
        s2.structureType == STRUCTURE_RAMPART
      ) {
        // return -1
        return (
          repairSiteTypes.indexOf(s1.structureType) -
          repairSiteTypes.indexOf(s2.structureType)
        );
      }

      return s1.hits / s1.hitsMax - s2.hits / s2.hitsMax;
    });

  var nearbyHostiles = room.find(FIND_HOSTILE_CREEPS);

  // set game globals
  Game.room = room;
  Game.leftSource = leftSource;
  Game.rightSource = rightSource;
  Game.leftRoomBottomSource = leftRoomBottomSource;
  Game.leftRoomTopSource = leftRoomTopSource;
  Game.spawn = spawn;
  Game.towers = towers;
  Game.controller = controller;
  Game.storage = storage;
  Game.orderedEnergyStorages = orderedEnergyStorages;
  Game.orderedConstrutionSites = orderedConstrutionSites;
  Game.orderedRepairSites = orderedRepairSites;
  Game.energyStructureTypes = energyStructureTypes;
  Game.leftLink = leftLink;
  Game.rightLink = rightLink;
  Game.nearbyHostiles = nearbyHostiles;

  // temporary creep creation
  // createCreep(spawn, "harvester", [CARRY, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK])

  // var attackerBody1 = [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK] // 1290
  // var attackerBody2 = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK] // 730
  // var attackerBody3 = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE] // 300
  // spawn.createCreep([MOVE], undefined, {role: ROLE_ATTACKER})

  // find counts of all creep types
  var numCreeps = 0,
    numAssistants = 0,
    numBuilders = 0,
    numUpgraders = 0,
    numRepairers = 0,
    numRemoteBuilders = 0,
    numTowerAssistants = 0,
    numHarvesters = 0,
    numLinkAssistants = 0;

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];

    switch (creep.memory.role) {
      case ROLE_ASSISTANT:
        numAssistants++;
        break;
      case ROLE_BUILDER:
        numBuilders++;
        break;
      case ROLE_UPGRADER:
        numUpgraders++;
        break;
      case ROLE_REPAIRER:
        numRepairers++;
        break;
      case ROLE_REMOTE_BUILDER:
        numRemoteBuilders++;
        break;
      case ROLE_TOWER_ASSISTANT:
        numTowerAssistants++;
        break;
      case ROLE_HARVESTER:
        numHarvesters++;
        break;
      case ROLE_LINK_ASSISTANT:
        numLinkAssistants++;
        break;
      default:
        break;
    }

    numCreeps++;
  }

  var body = null;

  // create creeps if necessary
  if (nearbyHostiles.length > 1) {
    createCreep(spawn, ROLE_ATTACKER, [ATTACK, ATTACK, MOVE, MOVE, MOVE]);
  } else if (numCreeps == 0 || numAssistants == 0) {
    createCreep(spawn, ROLE_ASSISTANT, body);
  } else if (room.energyAvailable >= config.minimumCreepSize) {
    if (numAssistants < config.requiredAssistants) {
      createCreep(spawn, ROLE_ASSISTANT, body);
    } else if (numRepairers < config.requiredRepairers) {
      createCreep(spawn, ROLE_REPAIRER, body);
    } else if (numBuilders < config.requiredBuilders) {
      createCreep(spawn, ROLE_BUILDER, body);
    } else if (numRemoteBuilders < config.requiredRemoteBuilders) {
      createCreep(spawn, ROLE_REMOTE_BUILDER, body);
    } else if (numTowerAssistants < config.requiredTowerAssistants) {
      createCreep(spawn, ROLE_TOWER_ASSISTANT, body);
    } else if (numHarvesters < config.requiredHarvesters) {
      createCreep(spawn, ROLE_HARVESTER, body);
    } else if (numUpgraders < config.requiredUpgraders) {
      createCreep(spawn, ROLE_UPGRADER, body);
    } else if (numLinkAssistants < config.requiredLinkAssistants) {
      createCreep(spawn, ROLE_LINK_ASSISTANT, body);
    }
  }

  // console.log("CREEP STATUS REPORT: ")

  // main creep loop
  var i = 1;
  for (var name in Game.creeps) {
    var creep = Game.creeps[name];

    // if (creep.memory.role == ROLE_ATTACKER) {
    //     var enemySpawn = Game.getObjectById("577c2e79c96c18174c107eea")
    //     var enemyWall = Game.getObjectById("577c2ea3a787e88703325029")
    //     var enemyWallPosition = new RoomPosition(48, 14, LEFT_ROOM)
    //     var enemyTower = Game.getObjectById("577cb6f51bc8331f3f20f6d5")
    //     var enemyFlag = Game.flags["Wall"]
    //     var enemyFlag2 = Game.flags["Wall2"]
    //     var enemyFlag3 = Game.flags["Wall3"]
    //     var waitFlag = Game.flags["Wait1"]
    //     var retreatFlag = Game.flags["Retreat"]
    //     var enemyController = Game.getObjectById("576a9c4b57110ab231d88d1e")
    //     var enemyExtension = Game.getObjectById("577c4a0ce31d0ab238b8302c")

    //     // console.log(`spawn: ${enemySpawn}`)
    //     // console.log(`wall: ${enemyWall}`)
    //     // console.log(`flag: ${enemyFlag}`)
    //     // console.log(`enemyWallPosition: ${enemyWallPosition}`)

    //     // creep.moveTo(retreatFlag)

    //     // var nearbyHostiles = sortByClosestToTarget(creep.room.find(FIND_HOSTILE_CREEPS), creep)
    //     // var hostile = nearbyHostiles[0]
    //     // if (creep.attack(hostile)) {
    //     //     creep.moveTo(hostile)
    //     // }

    //     if (creep.room.name == LEFT_ROOM) {
    //         if (creep.name == "A1") {
    //             if (creep.attack(enemyWall) == ERR_NOT_IN_RANGE) {
    //                 console.log(`${creep.name} is moving to enemy wall`)
    //                 creep.moveTo(enemyWall)
    //             }

    //             if (!enemyWall) {
    //                 if (creep.attack(enemyTower) == ERR_NOT_IN_RANGE) {
    //                     console.log(`${creep.name} is moving to enemyTower`)
    //                     creep.moveTo(enemyTower)
    //                 }
    //             }
    //         }
    //         // else if (enemyWall) {
    //         //     if (creep.attack(enemyWall) == ERR_NOT_IN_RANGE) {
    //         //         console.log(`${creep.name} is moving to enemy wall`)
    //         //         creep.moveTo(enemyWall)
    //         //     }
    //         // }
    //         // else { // wall destroyed
    //         //
    //         //     if (creep.attack(enemyController) == ERR_NOT_IN_RANGE) {
    //         //         console.log(`${creep.name} is moving to enemyExtension`)
    //         //         creep.moveTo(enemyExtension)
    //         //     }
    //         // }
    //     }
    //     else {
    //         if (creep.name == "A1") {
    //             console.log(`${creep.name} is moving to enemy flag`)
    //             creep.moveTo(enemyFlag3)
    //         }
    //         else {
    //             console.log(`${creep.name} is moving to enemy flag`)
    //             creep.moveTo(enemyFlag2)
    //         }
    //     }

    //     // creep.moveTo(retreatFlag)

    //     continue
    // }

    var target = findTarget(creep);
    var reachedCapacity = creep.carry.energy == creep.carryCapacity;
    var useRemoteSource = creep.memory.useRemoteSource;

    if (creep.memory.role == "tester") {
      // creep.moveTo(new RoomPosition(45, 13, "E11N31"))
      creep.moveTo(Game.flags["Test"]);
      continue;
    }

    if (target == ERR_TARGET_NOT_IN_ROOM) {
      if (!creep.memory.is_working) {
        creep.moveTo(exitFlag);
        console.log(`${creep.name} is moving to exit flag`);
      }
      continue;
    }

    // temporary attacker logic
    if (creep.memory.role == ROLE_ATTACKER && nearbyHostiles.length > 0) {
      var hostile = nearbyHostiles[0];
      if (creep.attack(hostile)) {
        creep.moveTo(hostile);
      }
      continue;
    }

    if (target) {
      // console.log(`${i}. ${creep.name} has target ${target.structureType} (${target.pos.x}, ${target.pos.y}) - TTL: ${creep.ticksToLive}`)

      // if not at capacity, and not currently assisting, then harvest or attempt to harvest
      if (!reachedCapacity && !creep.memory["is_working"]) {
        // harvest
        moveToSource(creep);
      } else {
        if (performAction(creep, target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        } else {
          creep.memory["is_working"] = true;
        }

        if (creep.carry.energy == 0) {
          creep.memory["is_working"] = false;
        }
      }
    } else {
      console.log(
        `!!! ${i}. ${creep.name} is unable to find a target! - TTL: ${creep.ticksToLive}`
      );

      var closestFlag = sortByClosestToTarget(
        [vacationFlag, vacationFlag2],
        creep
      )[0];
      if (creep.pos != closestFlag.pos) {
        // console.log(`${creep.name} is headed for ${closestFlag.name} flag (3)`)
        creep.moveTo(closestFlag);
      }
    }

    i++;
  }

  // main tower loop
  for (var i = 0; i < towers.length; i++) {
    let tower = towers[i];

    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
    } else {
      var towerRepairSites = _.filter(orderedRepairSites, function (s) {
        return s.structureType == STRUCTURE_ROAD;
      });

      if (towerRepairSites.length == 0) {
        towerRepairSites = orderedRepairSites;
      }

      // if (i == 0) {
      if (
        towerRepairSites.length > 0 &&
        tower.energy / tower.energyCapacity > 0.7
      ) {
        tower.repair(towerRepairSites[0]);
      }
      // }
    }
  }

  if (leftLink.energy == leftLink.energyCapacity) {
    leftLink.transferEnergy(rightLink);
  }

  console.log(
    `CONTROLLER STATUS REPORT: ${(
      (controller.progress / controller.progressTotal) *
      100
    ).toFixed(4)}% complete`
  );
};

function performAction(creep, target) {
  // is the target in the room I'm in? If yes, work/move, else move to the next room
  var role = creep.memory.role;
  var structures = creep.room
    .find(FIND_CONSTRUCTION_SITES)
    .concat(creep.room.find(FIND_STRUCTURES));

  if (_.includes(structures, target)) {
    switch (creep.memory.role) {
      case ROLE_ASSISTANT:
        return creep.transfer(target, RESOURCE_ENERGY);
      case ROLE_BUILDER:
        return creep.build(target);
      case ROLE_REMOTE_BUILDER:
        if (target.progress == null) {
          return creep.repair(target);
        } else {
          return creep.build(target);
        }
      case ROLE_REPAIRER:
        return creep.repair(target);
      case ROLE_UPGRADER:
        return creep.upgradeController(target);
      case ROLE_HARVESTER:
        return creep.transfer(target, RESOURCE_ENERGY);
      case ROLE_TOWER_ASSISTANT:
        return creep.transfer(target, RESOURCE_ENERGY);
      case ROLE_LINK_ASSISTANT:
        return creep.transfer(target, RESOURCE_ENERGY);
    }
  } else {
    if (creep.room.name == MAIN_ROOM) {
      // console.log(`${creep.name} is headed for Exit flag (1)`)
      creep.moveTo(Game.flags["Exit"]);
    } else {
      // console.log(`${creep.name} is headed for Entrance flag (2)`)
      creep.moveTo(Game.flags["Entrance"]);
    }
  }
}

function findTarget(creep) {
  var reachedCapacity = creep.carry.energy == creep.carryCapacity;
  if (
    creep.memory.useRemoteSource &&
    creep.room.name != LEFT_ROOM &&
    !creep.memory.is_working
  ) {
    return ERR_TARGET_NOT_IN_ROOM;
  }

  switch (creep.memory.role) {
    case ROLE_ASSISTANT:
      // assist the right tower if it is low
      if (Game.towers[1].energy < 900) {
        if (Game.nearbyHostiles.length > 0 || Game.room.energyAvailable > 600) {
          return Game.towers[1];
        }
      }

      // assist the towers if there are attackers
      if (Game.nearbyHostiles.length > 0) {
        var closestTower = sortByClosestToTarget(
          Game.towers,
          Game.nearbyHostiles[0]
        )[0];
        return closestTower;
      }

      // check for empty links that need to be filled
      if (creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
        return Game.rightLink;
      }

      var targets = sortByClosestToTarget(Game.orderedEnergyStorages, creep);

      var filteredTargets = _.filter(targets, function (s) {
        if (s.structureType == STRUCTURE_TOWER) {
          return false;
        }
        return true;
      });

      // if there are no non-tower things to fill, then fill the towers
      if (filteredTargets.length == 0) {
        return sortByClosestToTarget(Game.towers, creep)[0];
      } else {
        return filteredTargets[0];
      }

    // return Game.rightLink

    case ROLE_BUILDER:
      // var sites = sortByClosestToTarget(Game.orderedConstrutionSites, sourceForCreep(creep))
      return Game.orderedConstrutionSites[0];
    case ROLE_REPAIRER:
      return Game.orderedRepairSites[0];
    case ROLE_UPGRADER:
      return Game.controller;
    case ROLE_REMOTE_BUILDER:
      var targets = _.filter(creep.room.find(FIND_STRUCTURES), function (s) {
        if (s.progress == null) {
          return s.hits / s.hitsMax < 0.8;
        }
        return false;
      });

      if (!targets || targets.length == 0) {
        targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      }

      console.log(targets[0]);

      return targets[0];

    case ROLE_HARVESTER:
      return Game.storage;
    case ROLE_TOWER_ASSISTANT:
      // fill up the tower who's closest to the next site that needs repairing
      // var nextWallRepairSite = _.filter(Game.orderedRepairSites, function (s) {
      //     return (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)
      // })[0]
      // return nextWallRepairSite.pos.x <= 25 ? Game.towers[0] : Game.towers[1]
      return Game.towers[0];
    case ROLE_LINK_ASSISTANT:
      return Game.leftLink;
  }
}

function moveToSource(creep) {
  var source = sourceForCreep(creep);

  if (creep.memory.useRemoteSource) {
    if (creep.room.name == MAIN_ROOM) {
      creep.moveTo(Game.flags["Exit"]);
    } else if (creep.room.name == LEFT_ROOM) {
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
  } else {
    if (
      source.structureType == STRUCTURE_CONTAINER ||
      source.structureType == STRUCTURE_STORAGE ||
      source.structureType == STRUCTURE_LINK
    ) {
      if (source.structureType == STRUCTURE_LINK) {
        if (source.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }
      } else {
        if (source.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }
      }
    } else {
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
  }
}

function sourceForCreep(creep) {
  var role = creep.memory.role;

  switch (role) {
    case ROLE_ASSISTANT:
      // return Game.rightSource
      // if (creep.name == "Charlotte (a)") {
      //     return Game.rightSource
      // }
      return Game.rightSource;
    case ROLE_BUILDER:
      return Game.storage;
    case ROLE_REPAIRER:
      return Game.storage;
    case ROLE_UPGRADER:
      // return Game.container1
      return Game.storage;
    // if (creep.memory.useRemoteSource) {
    //     return creep.memory.useRemoteBottomSource ? Game.leftRoomBottomSource : Game.leftRoomTopSource
    // }
    // else {
    //     return Game.leftSource
    // }
    case ROLE_TOWER_ASSISTANT:
      // if (Game.storage.store[RESOURCE_ENERGY] >= 2000) {
      //     return Game.storage
      // }
      // else {
      //     return Game.leftLink
      // }
      return Game.storage;
    case ROLE_HARVESTER:
      return Game.leftSource;
    case ROLE_REMOTE_BUILDER:
      return creep.memory.useRemoteBottomSource
        ? Game.leftRoomBottomSource
        : Game.leftRoomTopSource;
    case ROLE_LINK_ASSISTANT:
      return Game.storage;
    default:
      var closestSource = sortByClosestToTarget(
        [Game.leftSource, Game.rightSource],
        creep
      )[0];
      return closestSource;
  }
}

function sortByClosestToTarget(objects, target) {
  return objects.sort(function (o1, o2) {
    var d1 = Math.sqrt(
      Math.pow(o1.pos.x - target.pos.x, 2) +
        Math.pow(o1.pos.y - target.pos.y, 2)
    );
    var d2 = Math.sqrt(
      Math.pow(o2.pos.x - target.pos.x, 2) +
        Math.pow(o2.pos.y - target.pos.y, 2)
    );

    if (d1 < d2) {
      return -1;
    } else if (d2 < d1) {
      return 1;
    } else {
      return 0;
    }
  });
}

function clearOldMemory() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log(name + " is ded");
    }
  }
}

function maxEnergyToSpendOnRole(role) {
  var maxRoomEnergy = Game.room.energyCapacityAvailable;
  switch (role) {
    case ROLE_ASSISTANT:
      return 450;
    case ROLE_BUILDER:
      return 450;
    case ROLE_REPAIRER:
      return 450;
    case ROLE_UPGRADER:
      return 450;
    case ROLE_HARVESTER:
      return 450;
    case ROLE_REMOTE_BUILDER:
      return 300;
    case ROLE_TOWER_ASSISTANT:
      return 300;
    case ROLE_LINK_ASSISTANT:
      return 300;
    default:
      return 300;
  }
}

function createCreep(spawn, role, body) {
  var energyAvailable = Game.room.energyAvailable;
  var roleEnergy = maxEnergyToSpendOnRole(role);

  var energyToUse = Math.min(energyAvailable, roleEnergy);

  if (!body) {
    if (energyToUse >= 300 && energyToUse < 350) {
      body = [WORK, WORK, CARRY, MOVE];
    } else if (energyToUse >= 350 && energyToUse < 400) {
      body = [WORK, WORK, CARRY, MOVE, MOVE];
    } else if (energyToUse >= 400 && energyToUse < 450) {
      body = [WORK, WORK, CARRY, MOVE, MOVE, MOVE];
    } else if (energyToUse >= 450 && energyToUse < 500) {
      body = [WORK, WORK, WORK, CARRY, MOVE, MOVE];
    } else if (energyToUse >= 500 && energyToUse < 550) {
      body = [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
    } else if (energyToUse >= 550 && energyToUse < 600) {
      body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
    } else if (energyToUse >= 600 && energyToUse < 650) {
      body = [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
    } else if (energyToUse >= 650 && energyToUse < 700) {
      body = [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE];
    } else if (energyToUse >= 700 && energyToUse < 750) {
      body = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
    } else if (energyToUse >= 750 && energyToUse < 800) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 800 && energyToUse < 850) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 850 && energyToUse < 900) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 900 && energyToUse < 950) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 950 && energyToUse < 1000) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 1000 && energyToUse < 1050) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 1050 && energyToUse < 1100) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 1100 && energyToUse < 1150) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 1150 && energyToUse < 1200) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 1200 && energyToUse < 1250) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 1250 && energyToUse < 1300) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else if (energyToUse >= 1300) {
      body = [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ];
    } else {
    }
  }

  var names = [
    "Noah",
    "Liam",
    "Mason",
    "Jacob",
    "William",
    "Ethan",
    "James",
    "Alexander",
    "Michael",
    "Benjamin",
    "Elijah",
    "Daniel",
    "Aiden",
    "Logan",
    "Matthew",
    "Lucas",
    "Jackson",
    "David",
    "Oliver",
    "Jayden",
    "Joseph",
    "Gabriel",
    "Samuel",
    "Carter",
    "Anthony",
    "John",
    "Dylan",
    "Luke",
    "Henry",
    "Andrew",
    "Isaac",
    "Christopher",
    "Joshua",
    "Wyatt",
    "Sebastian",
    "Owen",
    "Caleb",
    "Nathan",
    "Ryan",
    "Jack",
    "Hunter",
    "Levi",
    "Christian",
    "Jaxon",
    "Julian",
    "Landon",
    "Grayson",
    "Jonathan",
    "Isaiah",
    "Charles",
    "Emma",
    "Olivia",
    "Sophia",
    "Ava",
    "Isabella",
    "Mia",
    "Abigail",
    "Emily",
    "Charlotte",
    "Harper",
    "Madison",
    "Amelia",
    "Elizabeth",
    "Sofia",
    "Evelyn",
    "Avery",
    "Chloe",
    "Ella",
    "Grace",
    "Victoria",
    "Aubrey",
    "Scarlett",
    "Zoey",
    "Addison",
    "Lily",
    "Lillian",
    "Natalie",
    "Hannah",
    "Aria",
    "Layla",
    "Brooklyn",
    "Alexa",
    "Zoe",
    "Penelope",
    "Riley",
    "Leah",
    "Audrey",
    "Savannah",
    "Allison",
    "Samantha",
    "Nora",
    "Skylar",
    "Camila",
    "Anna",
    "Paisley",
    "Ariana",
    "Ellie",
    "Aaliyah",
    "Claire",
    "Violet",
  ];
  var roleSuffix = role == ROLE_REMOTE_BUILDER ? "rb" : role.charAt(0);
  var name =
    names[Math.floor(Math.random() * names.length)] + " (" + roleSuffix + ")";
  var useRemoteSource = false;
  var useRemoteBottomSource = false;

  // if (role == ROLE_REMOTE_BUILDER) {
  //     useRemoteSource = true
  //     useRemoteBottomSource = false
  // }
  // else if (role == ROLE_UPGRADER) {
  //     useRemoteSource = true
  //     useRemoteBottomSource = coinFlip()
  // }
  // else {
  //     useRemoteSource = false
  //     useRemoteBottomSource = false
  // }

  if (!spawn.spawning) {
    var canCreateCreep = spawn.canCreateCreep(body, name);
    if (canCreateCreep == OK) {
      spawn.createCreep(body, name, {
        role: role,
        useRemoteSource: useRemoteSource,
        useRemoteBottomSource: useRemoteBottomSource,
      });
    } else {
      console.log(
        `unable to create ${role} - energyToUse: ${energyToUse} (${canCreateCreep})`
      );
    }
  }
}

function coinFlip() {
  return Math.floor(Math.random() * 2) == 0;
}

// --------

var attackerRole = {
  /** @param {Creep} creep **/
  run: function (creep) {
    console.log("running attacker role!");
  },
};

module.exports = attackerRole;

var courierRole = {
  /** @param {Creep} creep **/
  run: function (creep) {
    console.log("running courier role!");
  },
};

module.exports = courierRole;

var heavyRole = {
  /** @param {Creep} creep **/
  run: function (creep) {
    console.log("running heavy role!");
  },
};

module.exports = heavyRole;

var workerRole = {
  /** @param {Creep} creep **/
  run: function (creep) {
    console.log("running worker role!");
  },
};

module.exports = workerRole;

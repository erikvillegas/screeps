require('helper')()

let Room = require('roomInfo')
let BodyConfig = require('bodyConfig').BodyConfig
let Body = require('bodyConfig').Body

let TaskType = {
    SourceAndTarget : "source-and-target",
    JustSource : "just-source",
    JustTarget : "just-target"
    // "None"? For explorer type?
}

// TODO: create "base specs" for most common tasks, and let each room tweak them
let TaskSpecs = {}

TaskSpecs[Room.hq.name] = [
    {
        name : "assist spawn",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                return Game.getObjectById("57cdb1b803d609134a538db9")
            },
            target : (creep, room) => {
                return room.storage
            },
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => {
            // if there are non-full spawn/extension structures
            return room.find(FIND_STRUCTURES, {
                filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
            }).length > 0
        },
        bodyTypes : [Body.Courier],
        maxCreeps : 2,
        maxCreepsInEmergency : 2,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "man left tower",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.hq.storage),
            target : (creep, room) => Game.getObjectById(Room.hq.leftTower),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 0,
        maxCreepsInEmergency : 2,
        maxCreepSize : "small",
        tickOverlap: 0
    },
    {
        name : "man right tower",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let rightTower1 = Game.getObjectById(Room.hq.rightTower)
                let rightTower2 = Game.getObjectById(Room.hq.rightTower2)
                let rightLink = Game.getObjectById(Room.hq.rightLink)
                let container = Game.getObjectById(Room.hq.rightTowerContainer)

                if (!rightTower1.isFull() || !rightTower2.isFull()) {
                    return rightLink.isEmpty() ? container : rightLink
                }
                else {
                    return rightLink
                }
            },
            target : (creep, room) => {
                let rightTower1 = Game.getObjectById(Room.hq.rightTower)
                let rightTower2 = Game.getObjectById(Room.hq.rightTower2)

                if (rightTower1.isFull() && rightTower2.isFull()) {
                    return Game.getObjectById(Room.hq.rightTowerContainer)
                }
                else if (rightTower1.energy < rightTower2.energy) {
                    return rightTower1
                }
                else {
                    return rightTower2
                }
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 0,
        maxCreepsInEmergency : 2,
        maxCreepSize : "medium",
        tickOverlap: 0
    },
    {
        name : "transport storage to left room",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                if (creep.ticksToLive > 50) {
                    return room.storage
                }
                else {
                    return null
                }
            },
            target : (creep, room) => Game.getObjectById(Room.left.storage),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        tickOverlap: 0
    },
    {
        name : "transport other stuff",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                return Game.getObjectById(Room.hq.lab2)
            },
            target : (creep, room) => Game.getObjectById(Room.hq.bottomLink),
            withdrawSourceType : RESOURCE_ENERGY,
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        bodyTypes : [Body.Courier],
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "attack user hostiles",
        task : {
            type: TaskType.JustTarget,
            source : (creep, room) => undefined,
            target : (creep, room) => creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS),
            action : (creep, target) => creep.attack(target),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => {
            let userHostiles = room.userHostiles()
            return userHostiles.length >= 2
        },
        bodyTypes : [Body.Attacker],
        maxCreeps : 8,
        maxCreepsInEmergency : 8,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest left source",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.hq.leftSource),
            target : (creep, room) => room.storage,
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest right source",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.hq.rightSource),
            target : (creep, room) => Game.getObjectById(Room.hq.rightLink),
            action : (creep, target) => {
                if (target.energy <= 760) {
                    return creep.transfer(target, RESOURCE_ENERGY)
                }
                else {
                    return creep.drop(RESOURCE_ENERGY)
                }
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 0,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "upgrade controller",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.hq.bottomLink),
            target : (creep, room) => Game.getObjectById(Room.hq.controller),
            action : (creep, target) => {
                return creep.upgradeController(target)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 6,
        maxCreepsInEmergency : 0,
        customCreepBody : [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY],
        tickOverlap: 0
    },
    {
        name : "dismantle",
        task : {
            type: TaskType.JustTarget,
            source : (creep, room) => null,
            target : (creep, room) => {
                return creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD}})
            },
            action : (creep, target) => {
                return creep.dismantle(target)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 2,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "dismantle 2",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById("57cdb46f6309836f25498ec4"),
            target : (creep, room) => {
                return room.storage
                //return creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD}})
            },
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_HYDROGEN)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transport dropped energy",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => creep.closestDroppedEnergy(0),
            target : (creep, room) => room.storage,
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => room.hasDroppedEnergy(100),
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "man left link",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage,
            target : (creep, room) => Game.getObjectById(Room.hq.leftLink),
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "small",
        tickOverlap: 0
    },
    {
        name : "defend remote miners",
        task : {
            type: TaskType.JustTarget,
            source : (creep, room) => undefined,
            target : (creep, room) => {
                let hostileCreepId = Memory.remoteHostileCreep
                let hostile = hostileCreepId ? Game.getObjectById(hostileCreepId) : null

                return hostile
            },
            action : (creep, target) => {
                let attackResult = creep.attack(target)
                creep.rangedAttack(target)
                return attackResult
            },
            remoteRoomFlag : Game.flags["RemoteDefense"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE],
        tickOverlap: 0
    },
    {
        name : "harvest remote #1",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => Game.getObjectById("576a9c4d57110ab231d88d5a"),
            target : (creep, room) => undefined,
            action : (creep, target) => undefined,
            remoteRoomFlag : Game.flags["TangoRoom"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, WORK, WORK, WORK],
        tickOverlap: 0
    },
    {
        name : "haul remote #1",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                // if no visibility, this returns null which will lead to creep moving to flag
                let remoteRoom = Game.rooms["E12N32"]
                return remoteRoom ? remoteRoom.find(FIND_DROPPED_ENERGY)[0] : null
            },
            target : (creep, room) => Game.getObjectById(Room.hq.topLink),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            remoteRoomFlag : Game.flags["TangoRoom"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
        customSpawn : Game.getObjectById(Room.hq.topSpawn),
        tickOverlap: 0
    },
    {
        name : "harvest remote #2",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => Game.getObjectById("576a9c4d57110ab231d88d57"),
            target : (creep, room) => Game.getObjectById(Game.bravo.rightLink),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            remoteRoomFlag : Game.flags["Bravo"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
        tickOverlap: 0
    },
    {
        name : "haul remote #2",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let roomPosition = new RoomPosition(41, 29, "E12N33")
                if (Game.rooms["E12N33"]) {
                    let droppedEnergies = roomPosition.lookNearbyFor(LOOK_ENERGY)
                    return droppedEnergies ? droppedEnergies[0] : null
                }
                else {
                    return null
                }
            },
            target : (creep, room) => Game.getObjectById(Room.hq.topLink),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            remoteRoomFlag : Game.flags["Bravo"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
        customSpawn : Game.getObjectById(Room.hq.topSpawn),
        tickOverlap: 0
    },
    {
        name : "harvest remote #3",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => Game.getObjectById("576a9c4d57110ab231d88d56"),
            target : (creep, room) => undefined,//Game.getObjectById(Room.bravo.topLink),
            action : (creep, target) => undefined,//creep.transfer(target, RESOURCE_ENERGY),
            remoteRoomFlag : Game.flags["Bravo"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
        tickOverlap: 0
    },
    {
        name : "haul remote #3",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let roomPosition = new RoomPosition(9, 22, "E12N33")
                if (Game.rooms["E12N33"]) {
                    let droppedEnergies = roomPosition.lookFor(LOOK_ENERGY)
                    return droppedEnergies ? droppedEnergies[0] : null
                }
                else {
                    return null
                }
            },
            target : (creep, room) => Game.getObjectById(Room.hq.topLink),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            remoteRoomFlag : Game.flags["Bravo"],
            ticksToTarget : 130,
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
        customSpawn : Game.getObjectById(Room.hq.topSpawn),
        tickOverlap: 0
    },
    {
        name : "nab left room energy",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById("579e0df47b94543f5e48b44f"),
            target : (creep, room) => Game.getObjectById(Room.hq.storage),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            ticksToTarget : 0,
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
        tickOverlap: 0
    },
    {
        name : "build shit",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                // let resource = creep.closestDroppedEnergy(100)
                // return resource ? resource : Game.getObjectById(Room.hq.storage)
                return Game.getObjectById(Room.hq.storage)
            },
            target : (creep, room) => creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES),
            action : (creep, target) => {
                return creep.build(target)
            },
            isFinished: target => (target == null),
            enabled: true
        },
        trigger: room => room.hasConstructionSites(),
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY],
        maxCreeps : 3,
        maxCreepsInEmergency : 0,
        tickOverlap: 0
    },
    {
        name : "transfer to terminal",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage,
            target : (creep, room) => Game.getObjectById(Room.hq.terminal),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => {
                let storage = Game.getObjectById(Room.hq.storage)
                return storage.store[RESOURCE_ENERGY] < 10000
            },
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "temp upgrade new room #1",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let roomPosition = new RoomPosition(9, 22, "E12N33")
                if (Game.rooms["E12N33"]) {
                    let droppedEnergies = roomPosition.lookNearbyFor(LOOK_ENERGY)
                    return droppedEnergies ? droppedEnergies[0] : null
                }
                else {
                    return null
                }
            },
            target : (creep, room) => Game.getObjectById("576a9c4d57110ab231d88d58"),//creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES),
            action : (creep, target) => creep.upgradeController(target),
            remoteRoomFlag : Game.flags["Bravo"],
            ticksToTarget : 0,
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
        customSpawn : Game.getObjectById(Room.hq.topSpawn),
        tickOverlap: 0
    },
    {
        name : "temp upgrade new room #2",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let roomPosition = new RoomPosition(41, 29, "E12N33")
                if (Game.rooms["E12N33"]) {
                    let droppedEnergies = roomPosition.lookNearbyFor(LOOK_ENERGY)
                    return droppedEnergies ? droppedEnergies[0] : null
                }
                else {
                    return null
                }
            },
            target : (creep, room) => Game.getObjectById("576a9c4d57110ab231d88d58"), //creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES),
            action : (creep, target) => creep.upgradeController(target),
            remoteRoomFlag : Game.flags["Bravo"],
            ticksToTarget : 0,
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
        customSpawn : Game.getObjectById(Room.hq.topSpawn),
        tickOverlap: 0
    },
    {
        name : "temp upgrade left room",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.left.storage),
            target : (creep, room) => Game.getObjectById(Room.left.controller),
            action : (creep, target) => creep.upgradeController(target),
            ticksToTarget : 0,
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        bodyTypes : [Body.Worker],
        maxCreepSize : "large",
        maxCreepsInEmergency : 0,
        tickOverlap: 0
    },
    {
        name : "harvest mineral",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.hq.mineral),
            target : (creep, room) => {
                return room.storage //Game.getObjectById(Room.hq.mineralContainer)
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_HYDROGEN),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => {
            // let container = Game.getObjectById(Room.hq.mineralContainer)
            // return !container.isFull()
            return true
        },
        bodyTypes : [Body.Worker],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transfer minerals from bravo",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.bravo.storage),
            target : (creep, room) => Game.getObjectById(Room.hq.storage),
            action : (creep, target) => creep.transfer(target, RESOURCE_OXYGEN),
            withdrawSourceType : RESOURCE_OXYGEN,
            ticksToTarget : 0,
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        bodyTypes : [Body.Courier],
        maxCreepSize : "large",
        customSpawn : Game.getObjectById(Room.hq.topSpawn),
        tickOverlap: 0
    },
    {
        name : "transfer minerals from left room",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.left.storage),
            target : (creep, room) => Game.getObjectById(Room.hq.storage),
            action : (creep, target) => creep.transfer(target, RESOURCE_LEMERGIUM),
            withdrawSourceType : RESOURCE_LEMERGIUM,
            ticksToTarget : 0,
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        bodyTypes : [Body.Courier],
        maxCreepSize : "large",
        tickOverlap: 0
    },
    // {
    //     name : "run labs",
    //     task : {
    //         type: TaskType.SourceAndTarget,
    //         source : (creep, room) => {
    //             return room.storage
    //         },
    //         target : (creep, room) => {
    //             let lab1 = Game.getObjectById(Room.hq.lab1)
    //             let lab2 = Game.getObjectById(Room.hq.lab2)
    //             let lab3 = Game.getObjectById(Room.hq.lab3)
    //
    //             if (lab1.energy < 1000) {
    //                 return lab1
    //             }
    //             else if (lab2.energy < 1000) {
    //                 return lab2
    //             }
    //             else if (lab1.mineralAmount < 1100) {
    //                 return lab1
    //             }
    //             else if (lab2.mineralAmount < 1000) {
    //                 return lab2
    //             }
    //
    //             return null
    //         },
    //         action : (creep, target) => {
    //             if (creep.carry[RESOURCE_ENERGY] > 0) {
    //                 return creep.transfer(target, RESOURCE_ENERGY)
    //             }
    //             else if (creep.carry[RESOURCE_HYDROGEN] > 0) {
    //                 return creep.transfer(target, RESOURCE_HYDROGEN)
    //             }
    //             else if (creep.carry[RESOURCE_OXYGEN] > 0) {
    //                 return creep.transfer(target, RESOURCE_OXYGEN)
    //             }
    //         },
    //         withdrawSourceType : (function() {
    //             let lab1 = Game.getObjectById(Room.hq.lab1)
    //             let lab2 = Game.getObjectById(Room.hq.lab2)
    //             let lab3 = Game.getObjectById(Room.hq.lab3)
    //
    //             // console.log(`lab1.isFullOfEnergy(): ${lab1.isFullOfEnergy()}`)
    //             // console.log(`lab2.isFullOfEnergy(): ${lab2.isFullOfEnergy()}`)
    //             // console.log(`lab1.isFullOfMineral(): ${lab1.isFullOfMineral()}`)
    //             // console.log(`lab2.isFullOfMineral(): ${lab2.isFullOfMineral()}`)
    //             // console.log("---")
    //
    //             if (lab1.energy < 1000 || lab2.energy < 1000) {
    //                 return RESOURCE_ENERGY
    //             }
    //             else if (lab1.mineralAmount < 1100) {
    //                 return RESOURCE_OXYGEN
    //             }
    //             else if (lab2.mineralAmount < 1000) {
    //                 return RESOURCE_HYDROGEN
    //             }
    //
    //             return null
    //         })(),
    //         isFinished: target => false,
    //         enabled: true
    //     },
    //     trigger: room => true,
    //     maxCreeps : 0,
    //     maxCreepsInEmergency : 0,
    //     bodyTypes : [Body.Courier],
    //     maxCreepSize : "large",
    //     tickOverlap: 0
    // },
    {
        name : "transfer minerals to terminal",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.hq.storage),
            target : (creep, room) => Game.getObjectById(Room.hq.terminal),
            action : (creep, target) => creep.transfer(target, RESOURCE_OXYGEN),
            withdrawSourceType : RESOURCE_OXYGEN,
            ticksToTarget : 0,
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        bodyTypes : [Body.Courier],
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transport energy to left room",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.hq.controller),
            target : (creep, room) => Game.getObjectById(Room.left.controller),
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => room.hasDroppedEnergy(0),
        bodyTypes : [Body.Courier],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
]

TaskSpecs[Room.right.name] = [
    {
        name : "assist spawn",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                // considerations:
                // - creep location
                // - dropped resources (early stage harvesting)
                // - crowded source
                // - using storage
                // - falling back to actual source if storage full
                return Game.getObjectById(Room.right.storage)
            },
            target : (creep, room) => {
                // return closest spawn/extensions closest to creep that isn't filled

                return creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: s => s.isOfStructureType([STRUCTURE_EXTENSION]) && !s.isFull()
                });
            },
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => {
            // if there are non-full spawn/extension structures
            return room.find(FIND_STRUCTURES, {
                filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
            }).length > 0
        },
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 2,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "man bottom tower", // all of them!
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let link = Game.getObjectById(Room.right.bottomLink)
                let container = Game.getObjectById(Room.right.towerContainer)

                if (link.energy > 0) {
                    return link
                }
                else {
                    return container
                }
            },
            target : (creep, room) => {

                let towers = [Game.getObjectById(Room.right.bottomTower), Game.getObjectById(Room.right.bottomTower2), Game.getObjectById(Room.right.bottomTower3), Game.getObjectById(Room.right.bottomTower4), Game.getObjectById(Room.right.bottomTower5)]

                let sortedTowers = towers.sort(function (t1, t2) { // sort by descending amount of energy
                    return (t1.energy > t2.energy)
                })

                return sortedTowers.length > 0 ? sortedTowers[0] : null
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        customSpawn : Game.getObjectById(Room.right.bottomSpawn),
        maxCreepSize : "small",
        tickOverlap: 0
    },
    {
        name : "man top tower",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.right.leftLink),
            target : (creep, room) => Game.getObjectById(Room.right.topTower),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 2,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "man top link",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.right.storage),
            target : (creep, room) => Game.getObjectById(Room.right.topLink),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "small",
        tickOverlap: 0
    },
    {
        name : "attack user hostiles",
        task : {
            type: TaskType.JustTarget,
            source : (creep, room) => undefined,
            target : (creep, room) => creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS),
            action : (creep, target) => creep.attack(target),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => {
            let userHostiles = room.userHostiles()
            return userHostiles.length >= 2
        },
        bodyTypes : [Body.Attacker],
        maxCreeps : 4,
        maxCreepsInEmergency : 4,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "upgrade controller",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.right.topSource),
            target : (creep, room) => room.controller,
            action : (creep, target) => {
                return creep.upgradeController(target)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => room.controller != undefined,
        bodyTypes : [Body.Heavy],
        maxCreeps : 3,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "upgrade controller from container",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.right.controllerContainer),
            target : (creep, room) => room.controller,
            action : (creep, target) => creep.upgradeController(target),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => room.controller != undefined,
        customCreepBody : [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest bottom source",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.right.bottomSource),
            target : (creep, room) => Game.getObjectById(Room.right.storage),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transfer to hq storage",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.right.storage),
            target : (creep, room) => Game.getObjectById(Room.hq.storage),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : undefined,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "build shit",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                // let resource = creep.closestDroppedEnergy(100)
                // return resource ? resource : Game.getObjectById(Room.hq.storage)
                return Game.getObjectById(Room.right.storage)
            },
            target : (creep, room) => creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES),
            action : (creep, target) => {
                return creep.build(target)
            },
            isFinished: target => (target == null),
            enabled: true
        },
        trigger: room => room.hasConstructionSites(),
        //customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY],
        bodyTypes : [Body.Worker],
        maxCreepSize : "large",
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        tickOverlap: 0
    },
    {
        name : "transfer from terminal",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.terminal,
            target : (creep, room) => room.storage,
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transfer to controller container",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.terminal,
            target : (creep, room) => Game.getObjectById(Room.right.controllerContainer),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => {
            let container = Game.getObjectById(Room.right.controllerContainer)
            if (container && container.store[RESOURCE_ENERGY] < 2000) {

                return true
            }
            else {
                return false
            }
        },
        bodyTypes : [Body.Courier],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
]

TaskSpecs[Room.left.name] = [
    {
        name : "assist spawn",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                if (room.storage.store[RESOURCE_ENERGY] >= 1000) {
                    return room.storage
                }
                else {
                    return room.terminal
                }
            },
            target : (creep, room) => {
                // return closest spawn/extensions closest to creep that isn't filled
                return creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
                });
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => {
            // if there are non-full spawn/extension structures
            return room.find(FIND_STRUCTURES, {
                filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
            }).length > 0
        },
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 2,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest bottom source",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.left.bottomSource),
            target : (creep, room) => room.storage,
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "man top tower",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let topTower = Game.getObjectById(Room.left.topTower)
                let topTower2 = Game.getObjectById(Room.left.topTower2)
                let middleLink = Game.getObjectById(Room.left.middleLink)
                let towersNeedFilling = !topTower.isFull() || !topTower2.isFull()

                if (towersNeedFilling) {
                    return room.storage
                }
                else {
                    return middleLink
                }
            },
            target : (creep, room) => {
                let topTower = Game.getObjectById(Room.left.topTower)
                let topTower2 = Game.getObjectById(Room.left.topTower2)
                let middleLink = Game.getObjectById(Room.left.middleLink)

                if (!topTower || !topTower2) {
                    return null
                }

                let towersNeedFilling = !topTower.isFull() || !topTower2.isFull()

                if (towersNeedFilling) {
                    if (!topTower.isFull()) {
                        return topTower
                    }
                    else if (!topTower2.isFull()) {
                        return topTower2
                    }
                }
                else {
                    return room.storage
                }
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "small",
        tickOverlap: 0
    },
    {
        name : "man bottom tower",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                return Game.getObjectById(Room.left.bottomLink)
            },
            target : (creep, room) => {
                return Game.getObjectById(Room.left.bottomTower)
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "medium",
        tickOverlap: 0
    },
    {
        name : "attack user hostiles",
        task : {
            type: TaskType.JustTarget,
            source : (creep, room) => undefined,
            target : (creep, room) => creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS),
            action : (creep, target) => creep.attack(target),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => {
            let userHostiles = room.userHostiles()
            return userHostiles.length >= 2
        },
        bodyTypes : [Body.Attacker],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "medium",
        tickOverlap: 0
    },
    {
        name : "harvest top source",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.left.topSource),
            target : (creep, room) => Game.getObjectById(Room.left.topLink),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transport dropped energy",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => creep.closestDroppedEnergy(100),
            target : (creep, room) => room.storage,
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => room.hasDroppedEnergy(0),
        bodyTypes : [Body.Courier],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    // {
    //     name : "transport storage to terminal (for real)",
    //     task : {
    //         type: TaskType.SourceAndTarget,
    //         source : (creep, room) => room.storage,
    //         target : (creep, room) => room.terminal,
    //         withdrawSourceType : RESOURCE_ENERGY,
    //         action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
    //         isFinished: target => false,
    //         enabled: true
    //     },
    //     trigger: room => true,
    //     maxCreeps : 0,
    //     maxCreepsInEmergency : 0,
    //     customCreepBody : [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
    //     tickOverlap: 0
    // },
    // {
    //     name : "transport storage to terminal",
    //     task : {
    //         type: TaskType.SourceAndTarget,
    //         source : (creep, room) => Game.getObjectById(Room.hq.storage),
    //         target : (creep, room) => {
    //             //creep.moveTo(room.storage)
    //             return room.storage
    //         },
    //         withdrawSourceType : RESOURCE_ENERGY,
    //         action : (creep, target) => creep.transfer(target, RESOURCE_LEMERGIUM),
    //         isFinished: target => false,
    //         enabled: true
    //     },
    //     trigger: room => true,
    //     maxCreeps : 0,
    //     maxCreepsInEmergency : 0,
    //     customCreepBody : [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
    //     tickOverlap: 0
    // },
    {
        name : "upgrade controller",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                return Game.getObjectById(Room.left.bottomLink)
            },
            target : (creep, room) => room.controller,
            action : (creep, target) => {
                return creep.upgradeController(target)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => room.controller != undefined,
        customCreepBody : [CARRY, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "build shit",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                // let resource = creep.closestDroppedEnergy(100)
                // return resource ? resource : Game.getObjectById(Room.left.topSource)
                return room.terminal
            },
            target : (creep, room) => creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES),
            action : (creep, target) => {
                return creep.build(target)
            },
            isFinished: target => (target == null),
            enabled: true
        },
        trigger: room => room.hasConstructionSites(),
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY],
        maxCreeps : 2,
        maxCreepsInEmergency : 0,
        maxCreepSize : "medium",
        tickOverlap: 0
    },
    {
        name : "harvest mineral",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.left.mineral),
            target : (creep, room) => {
                let container = Game.getObjectById(Room.left.mineralContainer)
                return container.isFull()? room.storage : container
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_LEMERGIUM),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Worker],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest remote #1",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => Game.getObjectById("576a9c4b57110ab231d88d19"),
            target : (creep, room) => undefined,
            action : (creep, target) => undefined,
            remoteRoomFlag : Game.flags["Congo"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, WORK, WORK, WORK],
        tickOverlap: 0
    },
    {
        name : "haul remote #1",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                // if no visibility, this returns null which will lead to creep moving to flag
                if (creep.room.name != "E11N32") {
                    return null
                }
                return creep.pos.findClosestByRange(FIND_DROPPED_ENERGY)
            },
            target : (creep, room) => Game.getObjectById(Room.left.storage),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            remoteRoomFlag : Game.flags["Congo"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
        tickOverlap: 0
    },
]

TaskSpecs[Room.bravo.name] = [
    {
        name : "assist spawn",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let container = Game.getObjectById(Room.bravo.energyContainer)

                if (container && container.store[RESOURCE_ENERGY] < 100) {
                    return room.storage
                }
                return container
            },
            target : (creep, room) => {
                // return closest spawn/extensions closest to creep that isn't filled
                let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    // SPAWN OMITTED TO SAVE SPACE
                    filter: s => s.isOfStructureType([STRUCTURE_EXTENSION]) && !s.isFull()
                });

                if (!target) { // all done, for now
                    creep.moveTo(Game.flags["Break"])
                    return OK
                }
                else {
                    return target
                }
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => {
            // if there are non-full spawn/extension structures
            return room.find(FIND_STRUCTURES, {
                filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
            }).length > 0
        },
        bodyTypes : [Body.Courier],
        maxCreeps : 2,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transport to energy container",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.bravo.storage),
            target : (creep, room) => {
                let container1 = Game.getObjectById(Room.bravo.energyContainer)
                let container2 = Game.getObjectById(Room.bravo.controllerContainer)

                return container1.isFull() ? container2 : container1
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "man bottom tower1",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                return room.storage//creep.pos.findClosestByRange(FIND_DROPPED_ENERGY)
            },
            target : (creep, room) => {
                let tower1 = Game.getObjectById(Room.bravo.tower1) // one on top
                let tower2 = Game.getObjectById(Room.bravo.tower2) // one in middle
                let tower3 = Game.getObjectById(Room.bravo.tower3) // one on bottom

                if (tower3.energy < tower3.energyCapacity) {
                    return tower3
                }
                else if (tower1.energy < tower2.energy) {
                    return tower1
                }
                else {
                    return tower2
                }
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 2,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "upgrade controller",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {

                // re-position creep to a better spot
                let usualPosition = new RoomPosition(25, 30, Room.bravo.name)

                if (creep.atPosition(usualPosition)) {
                    let newPosition = new RoomPosition(26, 30, Room.bravo.name)
                    creep.moveTo(newPosition)
                }

                return Game.getObjectById(Room.bravo.controllerContainer)
            },
            target : (creep, room) => room.controller,
            action : (creep, target) => {
                return creep.upgradeController(target)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => room.controller != undefined,
        customCreepBody : [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
        maxCreeps : 2,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest bottom source", // left
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.bravo.leftSource),
            target : (creep, room) => Game.getObjectById(Room.bravo.topLink),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest top source", // right
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.bravo.rightSource),
            target : (creep, room) => Game.getObjectById(Room.bravo.rightLink),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "man bottom link",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.bravo.bottomLink),
            target : (creep, room) => Game.getObjectById(Room.bravo.storage),
            action : (creep, target) => {

                // re-position creep to a better spot
                let usualPosition = new RoomPosition(26, 38, Room.bravo.name)

                if (creep.atPosition(usualPosition)) {
                    let newPosition = new RoomPosition(26, 37, Room.bravo.name)
                    creep.moveTo(newPosition)
                }

                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "small",
        tickOverlap: 0
    },
    {
        name : "build shit",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                return Game.getObjectById(Room.bravo.energyContainer)
            },
            target : (creep, room) => creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES),
            action : (creep, target) => {
                return creep.build(target)
            },
            isFinished: target => (target == null),
            enabled: true
        },
        trigger: room => room.hasConstructionSites(),
        bodyTypes : [Body.Worker],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest zulu",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => {
                return Game.getObjectById(Room.zulu.source)
            },
            target : (creep, room) => undefined,
            action : (creep, target) => undefined,
            remoteRoomFlag : Game.flags["Zulu"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Worker],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "build zulu construction sites",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let roomPosition = new RoomPosition(16, 5, Room.zulu.name)
                if (Game.rooms[Room.zulu.name]) {
                    let droppedEnergies = roomPosition.lookNearbyFor(LOOK_ENERGY)
                    return droppedEnergies ? droppedEnergies[0] : null
                }
                else {
                    return null
                }
            },
            target : (creep, room) => {
                let target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)

                if (!target) {
                    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: s => s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax
                    })
                }

                if (target) {
                    return target
                }
                else {
                    creep.moveTo(new RoomPosition(21, 11, Room.zulu.name))
                    return OK
                }
            },
            action : (creep, target) => {
                if (target instanceof ConstructionSite) {
                    return creep.build(target)
                }
                else {
                    return creep.repair(target)
                }

            },
            remoteRoomFlag : Game.flags["Zulu"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Worker],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "medium",
        tickOverlap: 0
    },
    {
        name : "transport dropped energy",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                return creep.closestDroppedEnergy(100)
            },
            target : (creep, room) => room.storage,
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => room.hasDroppedEnergy(0),
        bodyTypes : [Body.Courier],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transport dropped energy (zulu)",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let roomPosition = new RoomPosition(16, 6, Room.zulu.name)
                if (Game.rooms[Room.zulu.name]) {
                    let droppedEnergies = roomPosition.lookNearbyFor(LOOK_ENERGY)
                    return droppedEnergies ? droppedEnergies[0] : null
                }
                else {
                    return null
                }
            },
            target : (creep, room) => Game.getObjectById(Room.bravo.topLink),
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            remoteRoomFlag : Game.flags["Zulu"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => room.hasDroppedEnergy(0),
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "claim Foxtrot",
        task : {
            type: TaskType.JustTarget,
            source : (creep, room) => undefined,
            target : (creep, room) => Game.getObjectById(Room.foxtrot.controller),
            action : (creep, target) => {
                if (target) {
                    return creep.claimController(target)
                }
                else {
                    return creep.moveTo(Game.flags["Foxtrot"])
                }

            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [CLAIM, MOVE, MOVE, MOVE],
        tickOverlap: 0
    },
    {
        name : "harvest mineral",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.bravo.mineral),
            target : (creep, room) => {
                return room.storage
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_OXYGEN),
            isFinished: target => false,
            enabled: true
        },
        trigger: room => {
            return true
        },
        bodyTypes : [Body.Heavy],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest echo right source",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => Game.getObjectById(Room.echo.rightSource),
            target : (creep, room) => undefined,
            action : (creep, target) => undefined,
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
        tickOverlap: 0
    },
    {
        name : "harvest echo left source",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => Game.getObjectById(Room.echo.leftSource),
            target : (creep, room) => undefined,
            action : (creep, target) => undefined,
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
        tickOverlap: 0
    },
    {
        name : "temp upgrade echo controller",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                if (creep.room.name != Room.echo.name) {
                    return null
                }
                return Game.getObjectById(Room.echo.storage)
            },
            target : (creep, room) => {
                return Game.getObjectById(Room.echo.controller)
                // return creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
            },
            action : (creep, target) => creep.upgradeController(target),
            isFinished: target => false,
            remoteRoomFlag : Game.flags["Echo"],
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY],
        tickOverlap: 0
    },
    {
        name : "defend remote miners",
        task : {
            type: TaskType.JustTarget,
            source : (creep, room) => undefined,
            target : (creep, room) => {
                let hostileCreepId = Memory.remoteHostileCreep
                let hostile = hostileCreepId ? Game.getObjectById(hostileCreepId) : null

                return hostile
            },
            action : (creep, target) => {
                let attackResult = creep.attack(target)
                creep.rangedAttack(target)
                return attackResult
            },
            remoteRoomFlag : Game.flags["Zulu"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK],
        tickOverlap: 0
    },
    {
        name : "steal energy 1",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                if (creep.ticksToLive > 250) {
                    return Game.getObjectById("57c0bf9c9f5f7797052d26c3")
                }
                else {
                    return null
                }
            },
            target : (creep, room) => room.terminal,
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false,
            remoteRoomFlag : Game.flags["Charlie"],
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        tickOverlap: 0
    },
    {
        name : "upgrade Foxtrot room",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.foxtrot.rightLink),
            target : (creep, room) => Game.getObjectById(Room.foxtrot.controller),
            //target : (creep, room) => creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES),
            action : (creep, target) => creep.upgradeController(target),
            isFinished: target => false,
            remoteRoomFlag : Game.flags["Foxtrot"],
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        tickOverlap: 0
    },
    {
        name : "attack walls",
        task : {
            type: TaskType.JustTarget,
            source : (creep, room) => null,
            // target : (creep, room) => creep.pos.findClosestByRange(FIND_STRUCTURES, {
            //     filter: s => s.isOfStructureType([STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_LINK])
            // }),
            target: (creep, room) => Game.getObjectById("57a86eb45ce85865652e1b81"),
            action : (creep, target) => creep.dismantle(target),
            isFinished: target => false,
            remoteRoomFlag : Game.flags["Rawr"],
            enabled: true
        },
        trigger: room => true,
        customCreepBody : [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        tickOverlap: 0
    },
]

TaskSpecs[Room.echo.name] = [
    {
        name : "assist spawn",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage.store[RESOURCE_ENERGY] > 50000 ? room.storage : room.terminal,
            target : (creep, room) => {
                // return closest spawn/extensions closest to creep that isn't filled
                let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
                });

                if (!target) { // all done, for now
                    return OK
                }
                else {
                    return target
                }
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => {
            // if there are non-full spawn/extension structures
            return room.find(FIND_STRUCTURES, {
                filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
            }).length > 0
        },
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "small",
        tickOverlap: 0
    },
    {
        name : "harvest left source",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => Game.getObjectById(Room.echo.leftSource),
            target : (creep, room) => null,
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest right source",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => Game.getObjectById(Room.echo.rightSource),
            target : (creep, room) => null,
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "build shit",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage,
            target : (creep, room) => creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES),
            action : (creep, target) => {
                return creep.build(target)
            },
            isFinished: target => (target == null),
            enabled: true
        },
        trigger: room => room.hasConstructionSites(),
        bodyTypes : [Body.Worker],
        maxCreeps : 2,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "man towers",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage,
            target : (creep, room) => {
                let towers = [Game.getObjectById(Room.echo.topTower), Game.getObjectById(Room.echo.middleTower), Game.getObjectById(Room.echo.bottomTower)]

                if (!towers) {
                    return null
                }

                let sortedTowers = towers.sort(function (t1, t2) { // sort by descending amount of energy
                    return (t1.energy > t2.energy)
                })

                return sortedTowers.length > 0 ? sortedTowers[0] : null
            },
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "small",
        tickOverlap: 0
    },
    {
        name : "man bottom link",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage,
            target : (creep, room) => Game.getObjectById(Room.echo.bottomLink),
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transport dropped energy",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => creep.closestDroppedEnergy(100),
            target : (creep, room) => room.storage,
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 2,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "upgrade controller",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.echo.topLink),
            target : (creep, room) => room.controller,
            action : (creep, target) => {
                return creep.upgradeController(target)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 2,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "claim Sierra",
        task : {
            type: TaskType.JustTarget,
            source : (creep, room) => undefined,
            target : (creep, room) => Game.getObjectById(Room.sierra.controller),
            action : (creep, target) => {
                if (target) {
                    return creep.claimController(target)
                }
                else {
                    return creep.moveTo(Game.flags["Sierra"])
                }

            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [CLAIM, MOVE],
        tickOverlap: 0
    },
    {
        name : "harvest Sierra sources",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => {
                return Game.getObjectById(Room.sierra.rightSource)
            },
            target : (creep, room) => null,
            action : (creep, target) => null,
            remoteRoomFlag : Game.flags["Sierra"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Worker],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "build Sierra construction sites",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                if (creep.room.name != Room.sierra.name) {
                    return null
                }
                return creep.closestDroppedEnergy(0)
            },
            target : (creep, room) => {
                return creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
            },
            action : (creep, target) => {
                if (target instanceof ConstructionSite) {
                    return creep.build(target)
                }
                else {
                    return creep.repair(target)
                }
            },
            remoteRoomFlag : Game.flags["Sierra"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Worker],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "upgrade Sierra controller",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                if (creep.room.name != Room.sierra.name) {
                    return null
                }
                return creep.closestDroppedEnergy(0)
            },
            target : (creep, room) => {
                return Game.getObjectById(Room.sierra.controller)
            },
            action : (creep, target) => {
                return creep.upgradeController(target)
            },
            remoteRoomFlag : Game.flags["Sierra"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Worker],
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "defend remote miners",
        task : {
            type: TaskType.JustTarget,
            source : (creep, room) => undefined,
            target : (creep, room) => {
                if (creep.room.name != Room.sierra.name) {
                    return null
                }
                else {
                    return creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
                }
            },
            action : (creep, target) => {
                let attackResult = creep.attack(target)
                creep.rangedAttack(target)
                return attackResult
            },
            remoteRoomFlag : Game.flags["Sierra"],
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        maxCreeps : 0,
        maxCreepsInEmergency : 0,
        customCreepBody : [MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE],
        tickOverlap: 0
    },
]

TaskSpecs[Room.foxtrot.name] = [
    {
        name : "assist spawn",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage,
            target : (creep, room) => {
                // return closest spawn/extensions closest to creep that isn't filled
                return creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
                });
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "man tower",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage,
            target : (creep, room) => {
                let tower1 = Game.getObjectById(Room.foxtrot.tower1)
                let tower2 = Game.getObjectById(Room.foxtrot.tower2)

                if (tower1.energy < tower2.energy) {
                    return tower1
                }
                else {
                    return tower2
                }
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Worker],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest right source",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.foxtrot.rightSource),
            target : (creep, room) => Game.getObjectById(Room.foxtrot.bottomLink),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest left source",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => Game.getObjectById(Room.foxtrot.leftSource),
            target : (creep, room) => null,
            action : (creep, target) => null,
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transport dropped energy",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => creep.closestDroppedEnergy(0),
            target : (creep, room) => room.storage,
            action : (creep, target) => {
                return creep.transfer(target, RESOURCE_ENERGY)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => room.hasDroppedEnergy(100),
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "build",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage,
            target : (creep, room) => creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES),
            action : (creep, target) => creep.build(target),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => room.hasConstructionSites(),
        bodyTypes : [Body.Worker],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "load into right link",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.foxtrot.rightSourceContainer),
            target : (creep, room) => Game.getObjectById(Room.foxtrot.bottomLink),
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "medium",
        tickOverlap: 0
    },
    {
        name : "upgrade controller",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => Game.getObjectById(Room.foxtrot.rightLink),
            target : (creep, room) => room.controller,
            action : (creep, target) => {
                return creep.upgradeController(target)
            },
            isFinished: target => false,
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Heavy],
        maxCreeps : 2,
        maxCreepsInEmergency : 0,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transport to terminal",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => {
                let resource = Game.getObjectById("57db9f8533567e736e42af1f")
                return resource ? resource : room.storage
            },
            target : (creep, room) => room.terminal,
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => room.terminal.store[RESOURCE_ENERGY] < 300000,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
]

TaskSpecs[Room.sierra.name] = [
    {
        name : "assist spawn",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => creep.closestDroppedEnergy(0),
            target : (creep, room) => {
                // return closest spawn/extensions closest to creep that isn't filled
                return creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
                });
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => {
            // if there are non-full spawn/extension structures
            return room.find(FIND_STRUCTURES, {
                filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
            }).length > 0
        },
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "build",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => creep.closestDroppedEnergy(0),
            target : (creep, room) => creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES),
            action : (creep, target) => creep.build(target),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => room.hasConstructionSites(),
        bodyTypes : [Body.Worker],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "transport dropped energy",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => creep.closestDroppedEnergy(0),
            target : (creep, room) => room.storage,
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "harvest right source",
        task : {
            type: TaskType.JustSource,
            source : (creep, room) => Game.getObjectById(Room.sierra.rightSource),
            target : (creep, room) => null,
            action : (creep, target) => null,
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Worker],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "upgrade controller",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage,
            target : (creep, room) => room.controller,
            action : (creep, target) => creep.upgradeController(target),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Worker],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
    {
        name : "man towers",
        task : {
            type: TaskType.SourceAndTarget,
            source : (creep, room) => room.storage,
            target : (creep, room) => {
                let towers = [Game.getObjectById(Room.sierra.tower1)]

                let sortedTowers = towers.sort(function (t1, t2) { // sort by descending amount of energy
                    return (t1.energy > t2.energy)
                })

                return sortedTowers.length > 0 ? sortedTowers[0] : null
            },
            action : (creep, target) => creep.transfer(target, RESOURCE_ENERGY),
            isFinished: target => false, //target.isFull()
            enabled: true
        },
        trigger: room => true,
        bodyTypes : [Body.Courier],
        maxCreeps : 1,
        maxCreepsInEmergency : 1,
        maxCreepSize : "large",
        tickOverlap: 0
    },
]

module.exports.TaskSpecs = TaskSpecs
module.exports.TaskType = TaskType

let TowerSpecs = {}

// TowerSpecs[Room.hq.name] = {
//     name : "operate tower",
//     task : {
//         target : (tower, room) => {
//             return towerAction(tower, room, 0)
//         },
//         action : (tower, target) => {
//             if (target instanceof Structure) {
//                 return tower.repair(target)
//             }
//             else if (target instanceof Creep) {
//                 return tower.attack(target)
//             }
//         }
//     }
// }

TowerSpecs[Room.right.name] = {
    name : "operate tower",
    task : {
        target : (tower, room) => {
            return towerAction(tower, room, 1000000)
        },
        action : (tower, target) => {
            if (target instanceof Structure) {
                return tower.repair(target)
            }
            else if (target instanceof Creep) {
                return tower.attack(target)
            }
        }
    }
}

TowerSpecs[Room.left.name] = {
    name : "operate tower",
    task : {
        target : (tower, room) => {
            return towerAction(tower, room, 300000)
        },
        action : (tower, target) => {
            if (target instanceof Structure) {
                return tower.repair(target)
            }
            else if (target instanceof Creep) {
                return tower.attack(target)
            }
        }
    }
}

TowerSpecs[Room.bravo.name] = {
    name : "operate tower",
    task : {
        target : (tower, room) => {
            return towerAction(tower, room, 10000000)
        },
        action : (tower, target) => {
            if (target instanceof Structure) {
                return tower.repair(target)
            }
            else if (target instanceof Creep) {
                return tower.attack(target)
            }
        }
    }
}

TowerSpecs[Room.echo.name] = {
    name : "operate tower",
    task : {
        target : (tower, room) => {
            return towerAction(tower, room, 50000)
        },
        action : (tower, target) => {
            if (target instanceof Structure) {
                return tower.repair(target)
            }
            else if (target instanceof Creep) {
                return tower.attack(target)
            }
        }
    }
}

TowerSpecs[Room.foxtrot.name] = {
    name : "operate tower",
    task : {
        target : (tower, room) => {
            return towerAction(tower, room, 500000)
        },
        action : (tower, target) => {
            if (target instanceof Structure) {
                return tower.repair(target)
            }
            else if (target instanceof Creep) {
                return tower.attack(target)
            }
        }
    }
}

TowerSpecs[Room.sierra.name] = {
    name : "operate tower",
    task : {
        target : (tower, room) => {
            return towerAction(tower, room, 10000)
        },
        action : (tower, target) => {
            if (target instanceof Structure) {
                return tower.repair(target)
            }
            else if (target instanceof Creep) {
                return tower.attack(target)
            }
        }
    }
}

module.exports.TowerSpecs = TowerSpecs

function towerAction(tower, room, wallHits) {
    let repairSiteTypes = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_RAMPART, STRUCTURE_WALL, STRUCTURE_TOWER, STRUCTURE_CONTAINER, STRUCTURE_LINK, STRUCTURE_STORAGE]
    let orderedRepairSites = _.filter(room.find(FIND_STRUCTURES), function(s) {
        if (s.progress == null) {
            if (s.isOfStructureType([STRUCTURE_WALL, STRUCTURE_RAMPART])) {
                if (s.id == "57a39f48ed8b29f51d279d6c" || s.id == "57a39f4375c9c70d0ad1b764" || s.id == "57a39f46dcf1d3f50fcf6b9e") { // tower rampart
                    return s.hits < 1000000
                }
                else if (s.id == "57b2172f48a5b7057d8166fe" || s.id == "57b2172c1b0799d6061d474c") { // Right room outer output wall
                    return s.hits < 1000
                }
                else {
                    return s.hits < wallHits
                }
            }
            else {
                return (s.hits / s.hitsMax) < 0.9
            }
        }
        return false
    }).sort(function (s1, s2) { // sort by order in types
        return repairSiteTypes.indexOf(s1.structureType) - repairSiteTypes.indexOf(s2.structureType)
    }).sort(function (s1, s2) { // sort by who needs to repaired the most, favoring walls and ramparts first
            if (s1.structureType == STRUCTURE_WALL || s1.structureType == STRUCTURE_RAMPART) {
            // return 1
            return repairSiteTypes.indexOf(s1.structureType) - repairSiteTypes.indexOf(s2.structureType)
        }
        else if (s2.structureType == STRUCTURE_WALL || s2.structureType == STRUCTURE_RAMPART) {
            // return -1
            return repairSiteTypes.indexOf(s1.structureType) - repairSiteTypes.indexOf(s2.structureType)
        }

        return (s1.hits / s1.hitsMax) - (s2.hits / s2.hitsMax)
    })

    if (room.hasUserHostiles()) { // special logic for shooting at other users
        let userHostiles = room.userHostiles()
        let username = userHostiles[0].owner.username

        let numHealParts = room.numberOfHostileHealParts()

        let shouldAttack = true

        if (room.name == Room.left.name) {
            let hostileInGoodRange = false

            Room.left.towers.forEach(towerId => {
                let thisTower = Game.getObjectById(towerId)
                if (thisTower) {
                    let hostileNearby = thisTower.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0

                    if (hostileNearby) {
                        hostileInGoodRange = true
                    }
                }
            })

            if (!hostileInGoodRange && numHealParts >= 25) {
                shouldAttack = false
            }
        }
        else if (room.name == Room.hq.name) {
            let hostileInGoodRange = false

            Room.hq.towers.forEach(towerId => {
                let thisTower = Game.getObjectById(towerId)
                if (thisTower) {
                    let hostileNearby = thisTower.pos.findInRange(FIND_HOSTILE_CREEPS, 50).length > 0

                    if (hostileNearby) {
                        hostileInGoodRange = true
                    }
                }
            })

            if (!hostileInGoodRange && numHealParts >= 25) {
                shouldAttack = false
            }
        }
        else if (room.name == Room.right.name) {
            let hostileInGoodRange = false

            Room.right.towers.forEach(towerId => {
                let thisTower = Game.getObjectById(towerId)
                if (thisTower) {
                    let hostileNearby = thisTower.pos.findInRange(FIND_HOSTILE_CREEPS, 10).length > 0

                    if (hostileNearby) {
                        hostileInGoodRange = true
                    }
                }
            })

            if (!hostileInGoodRange && numHealParts >= 25) {
                shouldAttack = false
            }
        }
        else if (room.name == Room.bravo.name) {
            let hostileInGoodRange = false

            Room.bravo.towers.forEach(towerId => {
                let thisTower = Game.getObjectById(towerId)
                if (thisTower) {
                    let hostileNearby = thisTower.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0

                    if (hostileNearby) {
                        hostileInGoodRange = true
                    }
                }
            })

            if (!hostileInGoodRange && numHealParts >= 25) {
                shouldAttack = false
            }
        }

        if (room.name == Room.left.name) {
            // return Game.getObjectById("5802554c58bc1b4336806f86")
            //return tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
            return null
        }

        if (shouldAttack && tower) { // attack hostile closest to this tower
            return tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        }
    }
    else if (tower) {
        let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (closestHostile) {
            var username = closestHostile.owner.username
            return closestHostile
        }
        else {
            if (orderedRepairSites.length > 0 && tower.energy / tower.energyCapacity > 0.5) {
                return orderedRepairSites[0]
            }
        }
    }
}

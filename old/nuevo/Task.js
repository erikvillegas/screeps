// class Task {
//   constructor() {
//     this.name = null
//     this.type = null
//     this.source = null
//     this.target = null
//     this action = null
//     this.isFinished = null
//     this.enabled = null
//
//   }
// }
//
// class SpawnAssistantTask extends Task {
//   constructor() {
//     super()
//
//     this.name = null
//     this.type = null
//     this.source = null
//     this.target = null
//     this action = null
//     this.isFinished = null
//     this.enabled = null
//
//   }
// }
//
// class HarvestSourceTask extends Task {}
// class BuildTask extends Task {}
// class TransferTask extends Task {}

// name : "assist spawn",
// task : {
//     type: TaskType.SourceAndTarget,
//     source : (creep, room) => {
//         let resource = creep.closestDroppedEnergy(200)
//         return resource ? resource : Game.getObjectById(Room.left.topSource)
//     },
//     target : (creep, room) => {
//         // return closest spawn/extensions closest to creep that isn't filled
//         return creep.pos.findClosestByRange(FIND_STRUCTURES, {
//             filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
//         });
//     },
//     action : (creep, target) => {
//         return creep.transfer(target, RESOURCE_ENERGY)
//     },
//     isFinished: target => false, //target.isFull()
//     enabled: true
// },
// trigger: room => {
//     // if there are non-full spawn/extension structures
//     return room.find(FIND_STRUCTURES, {
//         filter: s => s.isOfStructureType([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) && !s.isFull()
//     }).length > 0
// },
// bodyTypes : [Body.Worker],
// maxCreeps : 1,
// maxCreepSize : "large",
// tickOverlap: 0

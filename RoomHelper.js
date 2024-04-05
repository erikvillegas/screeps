module.exports = function () {
  Room.prototype.hasConstructionSites = function () {
    return this.find(FIND_CONSTRUCTION_SITES).length > 0;
  };

  Game.prototype.clearCreepMemory = function () {
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log(name + " is ded");
      }
    }
  }
};

module.exports = function() {
  Structure.prototype.isFull = function() {
      return this.energy == this.energyCapacity
  };

  Structure.prototype.isEmpty = function() {
      return this.energy == 0
  };

  Creep.prototype.isFull = function() {
      let totalCarryAmount = _.sum(this.carry)
      return (totalCarryAmount == this.carryCapacity)
  };

  StructureContainer.prototype.isFull = function() {
      let totalStoreAmount = _.sum(this.store)
      return (totalStoreAmount == this.storeCapacity)
  }

  StructureLab.prototype.isFullOfEnergy = function() {
      return this.energy == this.energyCapacity
  }

  StructureLab.prototype.isFullOfMineral = function() {
      return this.mineralAmount == this.mineralCapacity
  }

  Creep.prototype.atPosition = function(pos) {
      return this.pos.x == pos.x && this.pos.y == pos.y && this.pos.roomName == pos.roomName
  };

  Creep.prototype.withdrawFromSource = function(source, sourceType) {
      // TODO: harvest() if Source, pickup() if Resource, withdraw() from Storage/Container
      if (source instanceof Resource) {
          return this.pickup(source)
      }
      else if (source instanceof Source || source instanceof Mineral) {
          return this.harvest(source)
      }
      else if (source instanceof StructureStorage || source instanceof StructureLink || source instanceof StructureContainer || source instanceof StructureTerminal || source instanceof StructureTower || source instanceof StructureLab || source instanceof StructureExtension || source instanceof StructureTower) {
          return this.withdraw(source, sourceType)
      }
  };

  Structure.prototype.isOfStructureType = function(types) {
      return types.indexOf(this.structureType) != -1
  };

  Creep.prototype.closestDroppedEnergy = function(amount) {
      return this.pos.findClosestByRange(FIND_DROPPED_ENERGY, {
          filter: r => r.amount >= amount
      });
  };

  Room.prototype.hasDroppedEnergy = function(amount) {
      return this.find(FIND_DROPPED_ENERGY, function(r) {
          return r.amount >= amount
      }).length > 0
  };

  RoomPosition.prototype.lookNearbyFor = function(objectType) {
      let item = null

      let topLeftPosition = new RoomPosition(this.x - 1, this.y - 1, this.roomName)
      items = topLeftPosition.lookFor(objectType)
      if (items.length > 0) return items

      let topPosition = new RoomPosition(this.x, this.y - 1, this.roomName)
      items = topPosition.lookFor(objectType)
      if (items.length > 0) return items

      let topRightPosition = new RoomPosition(this.x + 1, this.y - 1, this.roomName)
      items = topRightPosition.lookFor(objectType)
      if (items.length > 0) return items

      let leftPosition = new RoomPosition(this.x - 1, this.y, this.roomName)
      items = leftPosition.lookFor(objectType)
      if (items.length > 0) return items

      let centerPosition = new RoomPosition(this.x, this.y, this.roomName)
      items = centerPosition.lookFor(objectType)
      if (items.length > 0) return items

      let rightPosition = new RoomPosition(this.x + 1, this.y, this.roomName)
      items = rightPosition.lookFor(objectType)
      if (items.length > 0) return items

      let bottomLeftPosition = new RoomPosition(this.x - 1, this.y + 1, this.roomName)
      items = bottomLeftPosition.lookFor(objectType)
      if (items.length > 0) return items

      let bottomPosition = new RoomPosition(this.x, this.y + 1, this.roomName)
      items = bottomPosition.lookFor(objectType)
      if (items.length > 0) return items

      let bottomRightPosition = new RoomPosition(this.x + 1, this.y + 1, this.roomName)
      items = bottomRightPosition.lookFor(objectType)
      if (items.length > 0) return items

      return undefined
  };

  Room.prototype.hasConstructionSites = function() {
      return this.find(FIND_CONSTRUCTION_SITES).length > 0
  };

  Room.prototype.userHostiles = function() {
      return _.filter(this.find(FIND_HOSTILE_CREEPS), function(hostile) {
          return hostile.owner.username != "Invader"
      })
  };

  Room.prototype.hasUserHostiles = function() {
      return this.userHostiles().length > 0
  };

  Room.prototype.numberOfHostileHealParts = function() {
      let count = 0
      let hostiles = this.userHostiles()
      hostiles.forEach(hostile => {
          count += hostile.getActiveBodyparts(HEAL)
      })

      return count
  };
}

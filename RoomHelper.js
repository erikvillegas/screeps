module.exports = function () {
  Room.prototype.hasConstructionSites = function () {
    return this.find(FIND_CONSTRUCTION_SITES).length > 0;
  };

  
};

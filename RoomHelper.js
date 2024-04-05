module.exports = function () {
  Room.prototype.hasConstructionSites = function () {
    console.log("foobar");
    return this.find(FIND_CONSTRUCTION_SITES).length > 0;
  };

  
};

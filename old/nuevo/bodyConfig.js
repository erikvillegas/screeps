let Body = {
  Courier: "Courier",
  Worker: "Worker",
  Heavy: "Heavy",
  Attacker: "Attacker",
  Reserver: "Reserver",
};

let BodyConfig = {};

BodyConfig[Body.Courier] = {
  small: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // 300
  medium: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // 300
  large: [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], // 500
};

BodyConfig[Body.Worker] = {
  small: [CARRY, MOVE, MOVE, WORK], // 250
  medium: [CARRY, MOVE, MOVE, WORK, WORK], // 350
  large: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK], // 650
};

BodyConfig[Body.Heavy] = {
  small: [CARRY, MOVE, WORK], // 200
  medium: [CARRY, MOVE, WORK, WORK, WORK], // 400
  large: [CARRY, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK], // 650
};

BodyConfig[Body.Attacker] = {
  small: [MOVE, ATTACK, MOVE, ATTACK], // 260
  medium: [MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK], // 390
  large: [MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK], // 650
};

BodyConfig[Body.Reserver] = {
  small: [MOVE, CLAIM], // 650
  medium: [MOVE, CLAIM], // 650
  large: [MOVE, MOVE, CLAIM, CLAIM], // 1300
};

module.exports.BodyConfig = BodyConfig;
module.exports.Body = Body;

// --------------

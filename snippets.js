// optimizing resource utilization
const creepsUsingPrimarySource = creeps
      .map((c) => c.memory.source)
      .filter((id) => id === room.memory.sources[0]);
    creep.memory.source =
      creepsUsingPrimarySource < 4
        ? room.memory.sources[0]
        : room.memory.sources[1];
import { ALL_SQUADS } from './squads/index';

// Build flat lookup maps
const AGENTS_MAP = new Map();
const SQUADS_MAP = new Map();
const AGENTS_BY_SQUAD = new Map();

ALL_SQUADS.forEach(squad => {
  SQUADS_MAP.set(squad.id, {
    id: squad.id,
    name: squad.name,
    color: squad.color,
    homeRoom: squad.homeRoom,
    memberCount: squad.members.length,
  });

  const squadAgents = [];
  squad.members.forEach(member => {
    const agent = { ...member, squad: squad.id, squadName: squad.name, squadColor: squad.color, homeRoom: squad.homeRoom };
    AGENTS_MAP.set(member.id, agent);
    squadAgents.push(agent);
  });
  AGENTS_BY_SQUAD.set(squad.id, squadAgents);
});

export function getAgentById(id) {
  return AGENTS_MAP.get(id) || null;
}

export function getAgentsBySquad(squadId) {
  return AGENTS_BY_SQUAD.get(squadId) || [];
}

export function getSquadById(squadId) {
  return SQUADS_MAP.get(squadId) || null;
}

export function getAllAgents() {
  return Array.from(AGENTS_MAP.values());
}

export function getAllSquads() {
  return Array.from(SQUADS_MAP.values());
}

export function getAgentCount() {
  return AGENTS_MAP.size;
}

export { AGENTS_MAP, SQUADS_MAP };

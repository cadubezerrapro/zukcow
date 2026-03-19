import { getAllAgents, getAgentById, getAgentsBySquad, getAllSquads, getSquadById } from '../data/agents';

class AgentRegistry {
  constructor() {
    this.states = new Map(); // agentId -> { currentRoom, behaviorState, lastAction }
  }

  getAgent(id) {
    return getAgentById(id);
  }

  getSquad(squadId) {
    return getSquadById(squadId);
  }

  getAllAgents() {
    return getAllAgents();
  }

  getAllSquads() {
    return getAllSquads();
  }

  getAgentsBySquad(squadId) {
    return getAgentsBySquad(squadId);
  }

  updateState(agentId, state) {
    this.states.set(agentId, { ...this.states.get(agentId), ...state, updatedAt: Date.now() });
  }

  getState(agentId) {
    return this.states.get(agentId) || null;
  }

  // Stub for future AI chat integration
  async chatWithAgent(agentId, message) {
    const agent = this.getAgent(agentId);
    if (!agent) return null;
    // Future: call AI API with agent.systemPrompt + message
    return {
      agentId,
      response: agent.greeting || `Olá! Eu sou ${agent.name}, ${agent.role}.`,
    };
  }
}

export const agentRegistry = new AgentRegistry();
export default agentRegistry;

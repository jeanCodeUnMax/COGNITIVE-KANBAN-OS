import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const WORKSPACE_DIR = 'workspace';
export const STATE_FILE = 'kanban.json';

const defaultState = () => ({
  version: 1,
  project: {
    name: 'Mon projet',
    vision: '',
    objective: '',
    constraints: [],
    definitionOfDone: []
  },
  policy: {
    maxInProgress: 1,
    maxAutonomousIterations: 5,
    tokenMode: 'economy',
    humanValidation: ['architecture', 'backlog', 'destructive-action']
  },
  columns: {
    inbox: [],
    clarify: [],
    ready: [],
    doing: [],
    verify: [],
    blocked: [],
    done: []
  },
  decisions: [],
  metrics: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
});

export function workspacePath(cwd = process.cwd()) {
  return path.join(cwd, WORKSPACE_DIR);
}

export function statePath(cwd = process.cwd()) {
  return path.join(workspacePath(cwd), STATE_FILE);
}

export function ensureWorkspace(cwd = process.cwd()) {
  const dir = workspacePath(cwd);
  fs.mkdirSync(dir, { recursive: true });
  const file = statePath(cwd);
  if (!fs.existsSync(file)) saveState(defaultState(), cwd);
  return loadState(cwd);
}

export function loadState(cwd = process.cwd()) {
  return JSON.parse(fs.readFileSync(statePath(cwd), 'utf8'));
}

export function saveState(state, cwd = process.cwd()) {
  state.metrics.updatedAt = new Date().toISOString();
  fs.mkdirSync(workspacePath(cwd), { recursive: true });
  fs.writeFileSync(statePath(cwd), JSON.stringify(state, null, 2) + '\n');
  renderMarkdown(state, cwd);
}

export function makeCard(title, extras = {}) {
  return {
    id: crypto.randomUUID().slice(0, 8),
    title,
    why: extras.why ?? '',
    outcome: extras.outcome ?? '',
    acceptanceCriteria: extras.acceptanceCriteria ?? [],
    suggestedCommand: extras.suggestedCommand ?? '',
    skill: extras.skill ?? '',
    estimate: extras.estimate ?? 'S',
    parentId: extras.parentId ?? null,
    createdAt: new Date().toISOString()
  };
}

export function addIdea(text, cwd = process.cwd()) {
  const state = ensureWorkspace(cwd);
  const card = makeCard(text, { outcome: 'Idée clarifiée ou rejetée', skill: '/project' });
  state.columns.inbox.push(card);
  saveState(state, cwd);
  return card;
}

export function bootstrapProject(input, cwd = process.cwd()) {
  const state = ensureWorkspace(cwd);
  state.project = {
    ...state.project,
    name: input.name || state.project.name,
    vision: input.vision || '',
    objective: input.objective || '',
    constraints: input.constraints || [],
    definitionOfDone: input.definitionOfDone || []
  };
  const cards = [
    makeCard('Valider le périmètre V1', {
      why: 'Empêcher la vision globale de se transformer en chantier infini.',
      outcome: 'Une phrase de périmètre et une liste explicite de hors-périmètre.',
      acceptanceCriteria: ['Le résultat tient sur une page', 'Les exclusions sont écrites'],
      skill: '/architect', estimate: 'S'
    }),
    makeCard('Valider l’architecture minimale', {
      outcome: 'Architecture, technologies et flux principal documentés.',
      acceptanceCriteria: ['Aucun composant sans justification', 'Le chemin critique est identifiable'],
      skill: '/architect', estimate: 'M'
    }),
    makeCard('Générer le backlog atomique V1', {
      outcome: 'Chaque carte est testable et réalisable dans une session.',
      acceptanceCriteria: ['Une seule intention par carte', 'Critères de fin vérifiables'],
      skill: '/planner', estimate: 'M'
    }),
    makeCard('Exécuter la première carte prête', {
      outcome: 'Une modification réelle avec tests et preuve de validation.',
      acceptanceCriteria: ['Tests exécutés', 'Résultat résumé', 'Kanban mis à jour'],
      skill: '/execute-next', estimate: 'M'
    })
  ];
  state.columns.ready.push(...cards);
  saveState(state, cwd);
  return state;
}

export function nextCard(state) {
  if (state.columns.doing.length >= state.policy.maxInProgress) return null;
  return state.columns.ready[0] ?? state.columns.clarify[0] ?? state.columns.inbox[0] ?? null;
}

export function moveCard(id, target, cwd = process.cwd()) {
  const state = ensureWorkspace(cwd);
  if (!(target in state.columns)) throw new Error(`Colonne inconnue: ${target}`);
  let found;
  for (const cards of Object.values(state.columns)) {
    const index = cards.findIndex((c) => c.id === id);
    if (index >= 0) [found] = cards.splice(index, 1);
  }
  if (!found) throw new Error(`Carte introuvable: ${id}`);
  state.columns[target].push(found);
  saveState(state, cwd);
  return found;
}

export function splitCard(id, titles, cwd = process.cwd()) {
  const state = ensureWorkspace(cwd);
  let parent;
  for (const cards of Object.values(state.columns)) parent = parent ?? cards.find((c) => c.id === id);
  if (!parent) throw new Error(`Carte introuvable: ${id}`);
  const children = titles.map((title) => makeCard(title, {
    parentId: id,
    outcome: `Résultat atomique contribuant à : ${parent.title}`,
    acceptanceCriteria: ['Résultat observable', 'Validation possible sans interprétation'],
    skill: '/execute-next', estimate: 'S'
  }));
  state.columns.ready.unshift(...children);
  saveState(state, cwd);
  return children;
}

export function renderMarkdown(state, cwd = process.cwd()) {
  const labels = { inbox: 'Boîte à idées', clarify: 'À clarifier', ready: 'Prêt', doing: 'En cours', verify: 'À vérifier', blocked: 'Bloqué', done: 'Terminé' };
  const lines = [`# Kanban — ${state.project.name}`, '', `**Objectif :** ${state.project.objective || 'À définir'}`, '', `**Mode tokens :** ${state.policy.tokenMode}  `, `**Limite en cours :** ${state.policy.maxInProgress}`, ''];
  for (const [key, cards] of Object.entries(state.columns)) {
    lines.push(`## ${labels[key]} (${cards.length})`, '');
    if (!cards.length) lines.push('_Vide_', '');
    for (const card of cards) {
      lines.push(`- [ ] **${card.title}** \`${card.id}\` — taille ${card.estimate}`);
      if (card.outcome) lines.push(`  - Résultat : ${card.outcome}`);
      if (card.skill) lines.push(`  - Skill : \`${card.skill}\``);
      if (card.acceptanceCriteria.length) lines.push(`  - Fini quand : ${card.acceptanceCriteria.join(' ; ')}`);
    }
    lines.push('');
  }
  fs.writeFileSync(path.join(workspacePath(cwd), 'KANBAN.md'), lines.join('\n'));
}

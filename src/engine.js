import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const WORKSPACE_DIR = 'workspace';
export const STATE_FILE = 'kanban.json';
export const VALID_COLUMNS = Object.freeze(['inbox', 'clarify', 'ready', 'doing', 'verify', 'blocked', 'done']);
export const STARTABLE_COLUMNS = Object.freeze(['ready']);

const now = () => new Date().toISOString();

const defaultState = () => ({
  version: 2,
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
  metrics: { createdAt: now(), updatedAt: now() }
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
  state.metrics = state.metrics || {};
  state.metrics.updatedAt = now();
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
    createdAt: now()
  };
}

function initialCards() {
  return [
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
}

function columnEntries(state) {
  if (!state?.columns) return [];
  return Object.entries(state.columns).flatMap(([column, cards]) => {
    if (!Array.isArray(cards)) return [];
    return cards.map((card) => ({ column, card }));
  });
}

function hasCards(state) {
  return columnEntries(state).length > 0;
}

function hasObservableCriteria(card) {
  return Array.isArray(card?.acceptanceCriteria) && card.acceptanceCriteria.some((item) => String(item).trim().length > 0);
}

function isOversized(card) {
  const estimate = String(card?.estimate || 'S').trim().toUpperCase();
  return !['XS', 'S', 'M'].includes(estimate);
}

function maxInProgress(state) {
  const raw = state?.policy?.maxInProgress ?? 1;
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

export function validateState(state) {
  const errors = [];
  const warnings = [];
  const columns = state?.columns || {};

  if (!state || typeof state !== 'object') {
    return { ok: false, errors: ['Etat Kanban illisible.'], warnings, counts: {} };
  }

  for (const column of VALID_COLUMNS) {
    if (!Array.isArray(columns[column])) errors.push('Colonne manquante ou invalide: ' + column);
  }

  for (const column of Object.keys(columns)) {
    if (!VALID_COLUMNS.includes(column)) warnings.push('Colonne inconnue ignorée: ' + column);
  }

  const policyMax = state?.policy?.maxInProgress;
  if (!Number.isInteger(policyMax) || policyMax < 1) {
    errors.push('policy.maxInProgress doit être un entier positif.');
  }

  const seenIds = new Map();
  const readyTitles = new Map();
  const counts = Object.fromEntries(VALID_COLUMNS.map((column) => [column, Array.isArray(columns[column]) ? columns[column].length : 0]));

  for (const { column, card } of columnEntries(state)) {
    if (!card || typeof card !== 'object') {
      errors.push('Carte invalide dans ' + column + '.');
      continue;
    }

    if (!card.id) {
      errors.push('Carte sans id dans ' + column + '.');
    } else if (seenIds.has(card.id)) {
      errors.push('Id de carte dupliqué: ' + card.id + ' (' + seenIds.get(card.id) + ' + ' + column + ').');
    } else {
      seenIds.set(card.id, column);
    }

    if (!String(card.title || '').trim()) errors.push('Carte sans titre dans ' + column + '.');

    if (column === 'ready') {
      const titleKey = String(card.title || '').trim().toLowerCase();
      if (titleKey) readyTitles.set(titleKey, (readyTitles.get(titleKey) || 0) + 1);
      if (!hasObservableCriteria(card)) warnings.push('Carte ready sans critères observables: ' + (card.title || card.id));
      if (isOversized(card)) warnings.push('Carte ready trop grosse, à découper avant démarrage: ' + (card.title || card.id));
    }

    if (column === 'doing' || column === 'verify') {
      if (!hasObservableCriteria(card)) errors.push('Carte active sans critères observables: ' + (card.title || card.id));
    }

    if (column === 'doing' && isOversized(card)) {
      errors.push('Carte active trop grosse: ' + (card.title || card.id) + '. Découpage obligatoire.');
    }
  }

  for (const [title, count] of readyTitles.entries()) {
    if (count > 1) warnings.push('Titre dupliqué dans ready (' + count + 'x): ' + title);
  }

  if (counts.doing > maxInProgress(state)) {
    errors.push('Trop de cartes en cours: ' + counts.doing + '/' + maxInProgress(state) + '.');
  }

  return { ok: errors.length === 0, errors, warnings, counts };
}

export function formatDisciplineReport(diagnostics) {
  const lines = ['IFASTOS — discipline'];
  if (!diagnostics.errors.length && !diagnostics.warnings.length) {
    lines.push('OK: aucune violation détectée.');
    return lines;
  }

  for (const error of diagnostics.errors) lines.push('ERREUR: ' + error);
  for (const warning of diagnostics.warnings) lines.push('ALERTE: ' + warning);
  if (diagnostics.errors.length) lines.push('Action: corriger ces erreurs avant de démarrer une nouvelle carte.');
  return lines;
}

export function addIdea(text, cwd = process.cwd()) {
  const state = ensureWorkspace(cwd);
  const card = makeCard(text, { outcome: 'Idée clarifiée ou rejetée', skill: '/project' });
  state.columns.inbox.push(card);
  saveState(state, cwd);
  return card;
}

export function bootstrapProject(input = {}, cwd = process.cwd(), options = {}) {
  let state = options.reset ? defaultState() : ensureWorkspace(cwd);
  if (!options.append && !options.reset && hasCards(state)) {
    throw new Error('Workspace déjà initialisé. Utilise --force pour réinitialiser ou idea pour capturer une nouvelle idée.');
  }

  state.version = 2;
  state.project = {
    ...state.project,
    name: input.name || state.project.name,
    vision: input.vision || '',
    objective: input.objective || '',
    constraints: input.constraints || [],
    definitionOfDone: input.definitionOfDone || []
  };

  if (!state.columns) state.columns = defaultState().columns;
  for (const column of VALID_COLUMNS) if (!Array.isArray(state.columns[column])) state.columns[column] = [];
  state.columns.ready.push(...initialCards());
  saveState(state, cwd);
  return state;
}

export function nextCard(state) {
  const diagnostics = validateState(state);
  if (diagnostics.errors.length) return null;
  if ((state.columns.doing?.length || 0) >= maxInProgress(state)) return null;
  return state.columns.ready[0] ?? state.columns.clarify[0] ?? state.columns.inbox[0] ?? null;
}

export function startCard(id = null, cwd = process.cwd()) {
  const state = ensureWorkspace(cwd);
  const diagnostics = validateState(state);
  if (diagnostics.errors.length) {
    throw new Error('IFASTOS bloque le démarrage: ' + diagnostics.errors.join(' | '));
  }

  if (state.columns.doing.length >= maxInProgress(state)) {
    throw new Error('maxInProgress atteint: termine ou bloque la carte en cours avant de démarrer.');
  }

  const index = id
    ? state.columns.ready.findIndex((card) => card.id === id)
    : state.columns.ready.findIndex((card) => hasObservableCriteria(card) && !isOversized(card));

  if (index < 0) throw new Error(id ? 'Carte prête introuvable: ' + id : 'Aucune carte prête démarrable.');
  const card = state.columns.ready[index];
  if (!hasObservableCriteria(card)) throw new Error('Carte sans critères observables: ' + (card.title || card.id));
  if (isOversized(card)) throw new Error('Carte trop grosse: utiliser split avant start.');

  state.columns.ready.splice(index, 1);
  card.startedAt = now();
  state.columns.doing.push(card);
  saveState(state, cwd);
  return card;
}

export function moveCard(id, target, cwd = process.cwd()) {
  const state = ensureWorkspace(cwd);
  if (!(target in state.columns)) throw new Error('Colonne inconnue: ' + target);

  let found;
  let source;
  let sourceIndex = -1;
  for (const [column, cards] of Object.entries(state.columns)) {
    const index = cards.findIndex((card) => card.id === id);
    if (index >= 0) {
      found = cards[index];
      source = column;
      sourceIndex = index;
      break;
    }
  }

  if (!found) throw new Error('Carte introuvable: ' + id);

  if (target === 'doing' && source !== 'doing') {
    if (state.columns.doing.length >= maxInProgress(state)) {
      throw new Error('maxInProgress atteint: ' + state.columns.doing.length + '/' + maxInProgress(state));
    }
    if (!hasObservableCriteria(found)) throw new Error('Carte sans critères observables: ' + (found.title || found.id));
    if (isOversized(found)) throw new Error('Carte trop grosse: utiliser split avant doing.');
    found.startedAt = found.startedAt || now();
  }

  state.columns[source].splice(sourceIndex, 1);
  state.columns[target].push(found);
  saveState(state, cwd);
  return found;
}

export function splitCard(id, titles, cwd = process.cwd()) {
  const state = ensureWorkspace(cwd);
  let parent;
  for (const cards of Object.values(state.columns)) parent = parent ?? cards.find((card) => card.id === id);
  if (!parent) throw new Error('Carte introuvable: ' + id);
  const children = titles.map((title) => makeCard(title, {
    parentId: id,
    outcome: 'Résultat atomique contribuant à : ' + parent.title,
    acceptanceCriteria: ['Résultat observable', 'Validation possible sans interprétation'],
    skill: '/execute-next', estimate: 'S'
  }));
  state.columns.ready.unshift(...children);
  saveState(state, cwd);
  return children;
}

export function renderMarkdown(state, cwd = process.cwd()) {
  const labels = { inbox: 'Boîte à idées', clarify: 'À clarifier', ready: 'Prêt', doing: 'En cours', verify: 'À vérifier', blocked: 'Bloqué', done: 'Terminé' };
  const tick = String.fromCharCode(96);
  const lines = [
    '# Kanban — ' + state.project.name,
    '',
    '**Objectif :** ' + (state.project.objective || 'À définir'),
    '',
    '**Mode tokens :** ' + state.policy.tokenMode + '  ',
    '**Limite en cours :** ' + state.policy.maxInProgress,
    ''
  ];
  for (const key of VALID_COLUMNS) {
    const cards = Array.isArray(state.columns[key]) ? state.columns[key] : [];
    lines.push('## ' + labels[key] + ' (' + cards.length + ')', '');
    if (!cards.length) lines.push('_Vide_', '');
    for (const card of cards) {
      lines.push('- [ ] **' + card.title + '** ' + tick + card.id + tick + ' — taille ' + card.estimate);
      if (card.outcome) lines.push('  - Résultat : ' + card.outcome);
      if (card.skill) lines.push('  - Skill : ' + tick + card.skill + tick);
      if (card.acceptanceCriteria?.length) lines.push('  - Fini quand : ' + card.acceptanceCriteria.join(' ; '));
    }
    lines.push('');
  }
  fs.writeFileSync(path.join(workspacePath(cwd), 'KANBAN.md'), lines.join('\n') + '\n');
}

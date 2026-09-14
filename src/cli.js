#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { addIdea, bootstrapProject, ensureWorkspace, formatDisciplineReport, moveCard, nextCard, splitCard, startCard, validateState, workspacePath } from './engine.js';

const [rawCommand = 'help', ...rawArgs] = process.argv.slice(2);
const command = rawCommand === 'ifastos' ? (rawArgs.shift() || 'status') : rawCommand;
const flags = new Set(rawArgs.filter((arg) => arg.startsWith('--')));
const args = rawArgs.filter((arg) => !arg.startsWith('--'));

function printHelp() {
  console.log([
    '',
    'Cognitive Kanban OS',
    '',
    'Commandes:',
    '  init [fichier.json] [--force]  Initialise le workspace',
    '  demo [--force]                 Crée un projet de démonstration',
    '  idea <texte>                   Ajoute une idée brute',
    '  status                         Affiche le Kanban + diagnostic IFASTOS',
    '  doctor                         Vérifie les violations bloquantes',
    '  next                           Propose une seule prochaine action',
    '  start [id]                     Démarre une seule carte prête',
    '  move <id> <colonne>            Déplace une carte avec garde-fous',
    '  split <id> <a|b|c>             Découpe une carte',
    '',
    'Alias: ifastos status, ifastos doctor, ifastos start',
    'Colonnes: inbox, clarify, ready, doing, verify, blocked, done',
    ''
  ].join('\n'));
}

function printDiscipline(state) {
  const diagnostics = validateState(state);
  console.log('\n' + formatDisciplineReport(diagnostics).join('\n') + '\n');
  return diagnostics;
}

function status() {
  const state = ensureWorkspace();
  console.log('\n' + state.project.name + ' — ' + (state.project.objective || 'objectif à définir'));
  for (const [name, cards] of Object.entries(state.columns)) console.log(name.padEnd(8) + ' ' + cards.length);
  console.log('\nFichier vivant: ' + path.join(workspacePath(), 'KANBAN.md'));
  return printDiscipline(state);
}

try {
  if (command === 'init') {
    let input = {};
    if (args[0]) input = JSON.parse(fs.readFileSync(args[0], 'utf8'));
    bootstrapProject(input, process.cwd(), { reset: flags.has('--force') });
    console.log('Workspace créé dans ' + workspacePath());
  } else if (command === 'demo') {
    bootstrapProject({
      name: 'Cognitive Kanban OS',
      vision: 'Transformer une idée floue en travail vérifiable sans surcharge cognitive.',
      objective: 'Créer une V1 locale qui produit un backlog atomique et une prochaine action.',
      constraints: ['Node.js sans dépendance', 'Un seul item en cours', 'Budget de tokens explicite'],
      definitionOfDone: ['CLI fonctionnelle', 'Skills Claude Code installés', 'Tests verts']
    }, process.cwd(), { reset: flags.has('--force') });
    console.log('Démonstration créée. Lance: npm run status');
  } else if (command === 'idea') {
    if (!args.length) throw new Error('Ajoute le texte de ton idée.');
    const card = addIdea(args.join(' '));
    console.log('Idée ajoutée: ' + card.id);
  } else if (command === 'status') {
    status();
  } else if (command === 'doctor') {
    const diagnostics = status();
    if (diagnostics.errors.length) process.exitCode = 1;
  } else if (command === 'next') {
    const state = ensureWorkspace();
    const diagnostics = validateState(state);
    if (diagnostics.errors.length) {
      console.error(formatDisciplineReport(diagnostics).join('\n'));
      process.exitCode = 1;
    } else {
      const card = nextCard(state);
      if (!card) console.log('Aucune nouvelle carte: termine ou débloque la carte en cours.');
      else console.log('\nPROCHAINE ACTION\n' + card.title + '\nID: ' + card.id + '\nSkill: ' + (card.skill || '/split-task') + '\nFini quand: ' + ((card.acceptanceCriteria || []).join(' ; ') || 'critères à préciser') + '\n');
    }
  } else if (command === 'start') {
    const card = startCard(args[0] || null);
    console.log('Carte démarrée: ' + card.title + ' (' + card.id + ')');
  } else if (command === 'move') {
    const [id, target] = args;
    if (!id || !target) throw new Error('Usage: move <id> <colonne>');
    console.log('Carte déplacée: ' + moveCard(id, target).title);
  } else if (command === 'split') {
    const [id, raw] = args;
    if (!id || !raw) throw new Error('Usage: split <id> "étape 1|étape 2|étape 3"');
    const children = splitCard(id, raw.split('|').map((item) => item.trim()).filter(Boolean));
    console.log(children.length + ' sous-tâches créées.');
  } else printHelp();
} catch (error) {
  console.error('Erreur: ' + error.message);
  process.exitCode = 1;
}

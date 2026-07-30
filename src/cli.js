#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { addIdea, bootstrapProject, ensureWorkspace, loadState, moveCard, nextCard, splitCard, workspacePath } from './engine.js';

const [command = 'help', ...args] = process.argv.slice(2);

function printHelp() {
  console.log(`\nCognitive Kanban OS\n\nCommandes:\n  init [fichier.json]       Initialise le workspace\n  demo                      Crée un projet de démonstration\n  idea <texte>              Ajoute une idée brute\n  status                    Affiche l'état du Kanban\n  next                      Propose une seule prochaine action\n  move <id> <colonne>       Déplace une carte\n  split <id> <a|b|c>        Découpe une carte\n\nColonnes: inbox, clarify, ready, doing, verify, blocked, done\n`);
}

function status() {
  const state = ensureWorkspace();
  console.log(`\n${state.project.name} — ${state.project.objective || 'objectif à définir'}`);
  for (const [name, cards] of Object.entries(state.columns)) console.log(`${name.padEnd(8)} ${cards.length}`);
  console.log(`\nFichier vivant: ${path.join(workspacePath(), 'KANBAN.md')}\n`);
}

try {
  if (command === 'init') {
    let input = {};
    if (args[0]) input = JSON.parse(fs.readFileSync(args[0], 'utf8'));
    bootstrapProject(input);
    console.log(`Workspace créé dans ${workspacePath()}`);
  } else if (command === 'demo') {
    bootstrapProject({
      name: 'Cognitive Kanban OS',
      vision: 'Transformer une idée floue en travail vérifiable sans surcharge cognitive.',
      objective: 'Créer une V1 locale qui produit un backlog atomique et une prochaine action.',
      constraints: ['Node.js sans dépendance', 'Un seul item en cours', 'Budget de tokens explicite'],
      definitionOfDone: ['CLI fonctionnelle', 'Skills Claude Code installés', 'Tests verts']
    });
    console.log('Démonstration créée. Lance: npm run status');
  } else if (command === 'idea') {
    if (!args.length) throw new Error('Ajoute le texte de ton idée.');
    const card = addIdea(args.join(' '));
    console.log(`Idée ajoutée: ${card.id}`);
  } else if (command === 'status') status();
  else if (command === 'next') {
    const state = ensureWorkspace();
    const card = nextCard(state);
    if (!card) console.log('Aucune nouvelle carte: termine ou débloque la carte en cours.');
    else console.log(`\nPROCHAINE ACTION\n${card.title}\nID: ${card.id}\nSkill: ${card.skill || '/split-task'}\nFini quand: ${(card.acceptanceCriteria || []).join(' ; ') || 'critères à préciser'}\n`);
  } else if (command === 'move') {
    const [id, target] = args;
    if (!id || !target) throw new Error('Usage: move <id> <colonne>');
    console.log(`Carte déplacée: ${moveCard(id, target).title}`);
  } else if (command === 'split') {
    const [id, raw] = args;
    if (!id || !raw) throw new Error('Usage: split <id> "étape 1|étape 2|étape 3"');
    const children = splitCard(id, raw.split('|').map((x) => x.trim()).filter(Boolean));
    console.log(`${children.length} sous-tâches créées.`);
  } else printHelp();
} catch (error) {
  console.error(`Erreur: ${error.message}`);
  process.exitCode = 1;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { addIdea, bootstrapProject, loadState, nextCard, splitCard } from '../src/engine.js';

test('initialise un backlog et propose une prochaine action', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'ckanban-'));
  bootstrapProject({ name: 'Test', objective: 'Livrer une V1' }, cwd);
  const state = loadState(cwd);
  assert.equal(state.columns.ready.length, 4);
  assert.equal(nextCard(state).title, 'Valider le périmètre V1');
});

test('capture une idée et découpe une carte', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'ckanban-'));
  const idea = addIdea('Créer un bouton magique', cwd);
  const children = splitCard(idea.id, ['Définir le comportement', 'Créer le test'], cwd);
  assert.equal(children.length, 2);
});

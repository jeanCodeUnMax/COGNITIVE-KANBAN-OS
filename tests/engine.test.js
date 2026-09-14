import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { addIdea, bootstrapProject, loadState, moveCard, nextCard, startCard, validateState } from '../src/engine.js';

test('initialise un backlog et propose une prochaine action', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'ckanban-'));
  bootstrapProject({ name: 'Test', objective: 'Livrer une V1' }, cwd);
  const state = loadState(cwd);
  assert.equal(state.columns.ready.length, 4);
  assert.equal(nextCard(state).title, 'Valider le périmètre V1');
});

test('refuse de dupliquer un workspace existant sans --force', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'ckanban-'));
  bootstrapProject({ name: 'Test', objective: 'Livrer une V1' }, cwd);
  assert.throws(() => bootstrapProject({ name: 'Encore' }, cwd), /Workspace déjà initialisé/);
  bootstrapProject({ name: 'Reset' }, cwd, { reset: true });
  assert.equal(loadState(cwd).columns.ready.length, 4);
});

test('capture une idée et découpe une carte', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'ckanban-'));
  bootstrapProject({ name: 'Test', objective: 'Livrer une V1' }, cwd);
  const idea = addIdea('Créer un bouton magique', cwd);
  assert.throws(() => moveCard(idea.id, 'doing', cwd), /critères observables/);
});

test('démarre une seule carte prête et respecte maxInProgress', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'ckanban-'));
  bootstrapProject({ name: 'Test', objective: 'Livrer une V1' }, cwd);
  const first = startCard(null, cwd);
  const state = loadState(cwd);
  assert.equal(state.columns.doing.length, 1);
  assert.equal(state.columns.doing[0].id, first.id);
  assert.throws(() => moveCard(state.columns.ready[0].id, 'doing', cwd), /maxInProgress/);
});

test('diagnostique les ids dupliqués comme erreur bloquante', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'ckanban-'));
  const state = bootstrapProject({ name: 'Test', objective: 'Livrer une V1' }, cwd);
  state.columns.ready[1].id = state.columns.ready[0].id;
  const diagnostics = validateState(state);
  assert.equal(diagnostics.ok, false);
  assert.match(diagnostics.errors.join('\n'), /dupliqué/);
});

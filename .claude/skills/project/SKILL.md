---
name: project
description: Transformer une idée brute en cadrage de projet cohérent, puis préparer les documents et le Kanban sans commencer le développement.
disable-model-invocation: true
argument-hint: "<idée, objectif et contraintes>"
---

Prends `$ARGUMENTS` comme intention initiale.

1. Lis `docs/PRD.md`, `docs/DEVBOOK.md`, `docs/ROADMAP.md` et `workspace/kanban.json` s'ils existent.
2. Reformule : problème, utilisateur, résultat V1, contraintes, critères de réussite et hors-périmètre.
3. Identifie au maximum trois ambiguïtés critiques. Résous les autres par hypothèses explicites.
4. Mets à jour les documents concernés, sans coder la fonctionnalité.
5. Propose une architecture minimale et un backlog de 5 à 12 cartes maximum.
6. Chaque carte doit avoir : résultat, critères d’acceptation, taille S/M, dépendances et skill conseillé.
7. Demande validation avant de remplacer l’architecture ou le backlog existant.

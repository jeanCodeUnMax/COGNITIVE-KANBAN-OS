---
name: architect
description: Concevoir ou réviser une architecture minimale, budgétée et testable avant implémentation.
disable-model-invocation: true
argument-hint: "<objectif ou carte>"
context: fork
agent: plan
---

Analyse `$ARGUMENTS` et le dépôt.

Produit : options comparées, recommandation, flux principal, composants nécessaires, contrats d’entrée/sortie, risques, tests structurants et coût IA estimé. Refuse les composants sans utilité V1. Ne modifie aucun fichier de code. Mets la proposition dans `docs/DEVBOOK.md` ou une ADR et marque la validation humaine requise.

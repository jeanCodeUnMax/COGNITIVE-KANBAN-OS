---
name: split-task
description: Redécouper une carte trop floue, trop grosse ou bloquée en sous-tâches atomiques.
disable-model-invocation: true
argument-hint: "<id de carte ou description>"
---

Trouve la carte correspondant à `$ARGUMENTS`. Explique en une phrase pourquoi elle n’est pas exécutable. Découpe-la selon : découverte minimale, modification la plus petite, test, intégration/documentation. Chaque enfant doit produire une preuve observable et ne dépendre que du précédent lorsque nécessaire. Mets à jour `workspace/kanban.json` et régénère `workspace/KANBAN.md` via la CLI si possible.

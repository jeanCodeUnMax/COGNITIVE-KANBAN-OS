---
name: budget-guard
description: Réduire le coût en contexte et tokens avant une tâche longue ou multi-agent.
disable-model-invocation: true
argument-hint: "<tâche envisagée>"
---

Évalue `$ARGUMENTS` selon complexité, contexte nécessaire et vérifiabilité. Propose le chemin le moins coûteux : commande déterministe, lecture ciblée, skill unique, subagent isolé, puis modèle puissant seulement en dernier recours. Fixe un plafond d’itérations et une condition d’arrêt. Signale tout travail redondant déjà présent dans les fichiers ou décisions.

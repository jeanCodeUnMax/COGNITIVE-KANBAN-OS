---
name: execute-next
description: Prendre exactement une carte prête, l'implémenter, la tester et mettre à jour le Kanban.
disable-model-invocation: true
---

1. Lance `node src/cli.js ifastos doctor`. Si une erreur existe, corrige l'état du Kanban avant de continuer.
2. Lance `node src/cli.js next` pour lire la prochaine action.
3. Lance `node src/cli.js start` ou `node src/cli.js start <id>` pour déplacer une seule carte vers `doing` avec garde-fou.
4. Vérifie les critères d'acceptation ; s'ils sont ambigus, utilise `/split-task` et arrête.
5. Fais le changement minimal, sans opportunisme hors périmètre.
6. Lance les tests pertinents. Maximum 5 cycles correction-test.
7. En cas de succès : déplace vers `verify`, résume fichiers changés, tests et limites, puis relance `node src/cli.js ifastos doctor`.
8. En cas d'échec persistant : déplace vers `blocked`, conserve stdout/stderr utile et propose une décision humaine.

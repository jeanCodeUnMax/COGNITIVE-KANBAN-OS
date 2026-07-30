---
name: execute-next
description: Prendre exactement une carte prête, l’implémenter, la tester et mettre à jour le Kanban.
disable-model-invocation: true
---

1. Lance `node src/cli.js next` et sélectionne uniquement cette carte.
2. Déplace-la vers `doing` avant modification.
3. Vérifie les critères d’acceptation ; s’ils sont ambigus, utilise `/split-task` et arrête.
4. Fais le changement minimal, sans opportunisme hors périmètre.
5. Lance les tests pertinents. Maximum 5 cycles correction-test.
6. En cas de succès : déplace vers `verify`, résume fichiers changés, tests et limites.
7. En cas d’échec persistant : déplace vers `blocked`, conserve stdout/stderr utile et propose une décision humaine.

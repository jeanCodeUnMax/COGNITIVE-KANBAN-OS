# Cognitive Kanban OS — Starter Kit V0.2

Un **workflow cognitif vivant** : tu donnes une vision, il la transforme en périmètre, architecture, backlog atomique, prochaine action et boucle de validation.

## Démarrage en deux clics sous Windows

1. Décompresse le ZIP.
2. Double-clique `START-HERE.bat`.

Pré-requis : Node.js 20 ou plus.

## Démarrage terminal

```bash
npm test
npm run demo -- --force
npm run status
npm run doctor
npm run next
npm run start-card
```

`status` affiche maintenant le diagnostic IFASTOS. `doctor` renvoie un code d'erreur si une règle bloquante est cassée.

Créer ton projet :

```bash
cp project.example.json mon-projet.json
# modifie mon-projet.json
node src/cli.js init mon-projet.json --force
```

Capturer une idée sans casser le focus :

```bash
node src/cli.js idea "Ajouter une vue cockpit Star Trek"
```

## Commandes IFASTOS

```bash
node src/cli.js ifastos status
node src/cli.js ifastos doctor
node src/cli.js ifastos start
```

IFASTOS bloque maintenant les dérives mécaniques :

- pas plus d'une carte en `doing` si `maxInProgress` vaut 1 ;
- pas de démarrage sans critères d'acceptation observables ;
- pas de carte trop grosse en exécution ;
- pas de duplication silencieuse du workspace avec `demo` ou `init`.

## Utilisation avec Claude Code

Ouvre ce dossier dans le terminal puis lance `claude`. Les skills du projet sont dans `.claude/skills/` :

- `/project` : transforme l'idée en dossier projet cohérent ;
- `/architect` : propose l'architecture avec garde-fous ;
- `/planner` : génère un backlog atomique ;
- `/split-task` : redécoupe une carte trop floue ;
- `/execute-next` : exécute une seule carte, teste et met à jour le Kanban ;
- `/review` : contrôle qualité et critères d'acceptation ;
- `/budget-guard` : réduit la consommation de tokens.

Pour une boucle autonome vérifiable, utilise ensuite une condition comme :

```text
/goal la carte en cours satisfait tous ses critères d'acceptation, les tests sont verts, npm run doctor passe et workspace/kanban.json est à jour
```

Commence avec une seule carte et `maxInProgress: 1`. L'autonomie sans limite est volontairement hors V1.

## Principe de sécurité

Le système peut proposer et exécuter, mais exige une validation humaine avant : architecture, backlog initial et action destructive. La V1 optimise d'abord la clarté, la traçabilité et le coût.

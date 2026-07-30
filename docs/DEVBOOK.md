# DevBook

## Architecture V0.1

- `src/engine.js` : état, cartes, déplacement, découpage, rendu Markdown.
- `src/cli.js` : interface terminal sans dépendance.
- `workspace/kanban.json` : source de vérité lisible par machine.
- `workspace/KANBAN.md` : projection lisible par humain.
- `.claude/skills/` : méthodes réutilisables et commandes slash.
- `.claude/agents/` : rôles spécialisés optionnels, invoqués à la demande.

## Flux
1. L’utilisateur capture une vision ou une idée.
2. `/architect` propose un périmètre et une architecture.
3. Après validation, `/planner` crée des cartes atomiques.
4. `/execute-next` prend une seule carte prête.
5. Les tests alimentent `/review`.
6. La carte passe à `done` ou `blocked`; la prochaine action est recalculée.

## Stratégie tokens
- aucun agent permanent ;
- un rôle invoqué à la fois ;
- exploration et tri sur modèle économique ;
- modèle plus puissant uniquement pour architecture ambiguë ou blocage ;
- contexte isolé via subagents pour éviter de polluer la session principale ;
- cache documentaire dans le dépôt ;
- nombre maximal d’itérations autonome : 5.

## Évolution prévue
V0.2 : adaptateur Ollama et génération assistée de backlog. V0.3 : interface web locale. V0.4 : synchronisation GitHub Issues/Projects. V0.5 : exécution multi-agent budgétée.

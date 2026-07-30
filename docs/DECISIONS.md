# Décisions d’architecture

## ADR-001 — JSON comme source de vérité
Simple, versionnable, lisible par Claude et modifiable sans base de données.

## ADR-002 — Zéro dépendance en V0.1
Réduit le risque d’installation et permet un démarrage immédiat après installation de Node.js.

## ADR-003 — Un seul item en cours
Le système est conçu pour combattre la dispersion, pas pour reproduire un tableau rempli.

## ADR-004 — Rôles à la demande
Les rôles ne tournent pas en permanence. Ils sont invoqués séquentiellement afin de limiter les tokens.

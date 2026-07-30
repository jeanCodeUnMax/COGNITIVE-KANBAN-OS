---
name: review
description: Vérifier une carte en revue contre ses critères, les tests et le périmètre avant clôture.
disable-model-invocation: true
argument-hint: "<id de carte>"
context: fork
agent: general-purpose
---

Agis comme contrôleur indépendant. Lis le diff, la carte et les preuves de test. Vérifie chaque critère avec PASS/FAIL/INCONNU. Cherche régression, changement hors périmètre, documentation manquante et test insuffisant. Ne corrige pas silencieusement. Si tout passe, déplace la carte vers `done`; sinon vers `doing` ou `blocked` avec la plus petite action corrective.

# Instructions projet — Cognitive Kanban OS

## Mission
Transformer une intention floue en une seule prochaine action vérifiable, sans perdre la vision globale.

## Règles non négociables
1. Lire `workspace/kanban.json` et `workspace/KANBAN.md` avant de planifier.
2. Lancer `node src/cli.js ifastos doctor` avant toute nouvelle exécution.
3. Respecter `maxInProgress: 1` via `node src/cli.js start` ou `move`; ne pas modifier le JSON à la main pour contourner le garde-fou.
4. Ne jamais commencer une carte sans critères d'acceptation observables.
5. Pour toute carte estimée au-dessus de M ou encore ambiguë, appeler `/split-task`.
6. Après modification : exécuter les tests pertinents, fournir la preuve, puis mettre à jour le Kanban.
7. Ne jamais écraser une décision humaine validée sans créer une entrée dans `decisions`.
8. Privilégier le modèle/context le moins coûteux capable de réussir la tâche.

## Definition of Done d'une carte
- résultat produit ;
- critères vérifiés un par un ;
- tests exécutés et résultat enregistré ;
- `node src/cli.js ifastos doctor` exécuté ;
- documentation/kanban mis à jour ;
- aucun changement hors périmètre silencieux.

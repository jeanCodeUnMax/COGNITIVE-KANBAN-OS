# Instructions projet — Cognitive Kanban OS

## Mission
Transformer une intention floue en une seule prochaine action vérifiable, sans perdre la vision globale.

## Règles non négociables
1. Lire `workspace/kanban.json` et `workspace/KANBAN.md` avant de planifier.
2. Respecter `maxInProgress: 1`.
3. Ne jamais commencer une carte sans critères d'acceptation observables.
4. Pour toute carte estimée au-dessus de M ou encore ambiguë, appeler `/split-task`.
5. Après modification : exécuter les tests pertinents, fournir la preuve, puis mettre à jour le Kanban.
6. Ne jamais écraser une décision humaine validée sans créer une entrée dans `decisions`.
7. Privilégier le modèle/context le moins coûteux capable de réussir la tâche.

## Definition of Done d'une carte
- résultat produit ;
- critères vérifiés un par un ;
- tests exécutés et résultat enregistré ;
- documentation/kanban mis à jour ;
- aucun changement hors périmètre silencieux.

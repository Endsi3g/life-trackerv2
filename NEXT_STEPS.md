# Prochaines Étapes : Life Tracker

Félicitations ! L'application est maintenant fonctionnelle, esthétique et stable. Voici les recommandations pour les prochaines phases de développement.

## 1. Notifications Push (Haute Priorité)
Depuis que vous utilisez Capacitor, l'ajout de notifications est l'étape logique pour engager l'utilisateur (rappels d'habitudes, fin de timer).
- **Action** : Installer `@capacitor/push-notifications`.
- **Plateformes** : Configurer Firebase Cloud Messaging (FCM) pour Android et APNS pour iOS.

## 2. Synchronisation Cloud & Authentification
Actuellement, les données sont stockées localement (`localStorage`). Pour ne pas perdre ses données en changeant de téléphone :
- **Action** : Intégrer **Supabase** (déjà présent dans le projet) pour sauvegarder le profil utilisateur et ses données (`habitLog`, `tasks`, `notes`).
- **Authentification** : Utiliser Supabase Auth (Magic Link ou Google) pour une connexion simplifiée.

## 3. Assistant IA (Concept "Cal.com for Life")
L'IA peut analyser les tendances de l'utilisateur pour proposer des améliorations de vie.
- **Action** : Utiliser l'API OpenAI pour analyser les notes du Journal et suggérer des ajustements d'habitudes ou booster la motivation via des toasts personnalisés.

## 4. Widgets & Intégration OS
- **Action** : Créer des widgets pour l'écran d'accueil (Android/iOS) affichant le score du jour ou le timer Focus en cours.

## 5. Export de Données et Statistiques
- **Action** : Ajouter un onglet "Statistiques" avec des graphiques (`Recharts` ou `Chart.js`) pour visualiser l'évolution du score sur le mois/l'année.

---
*Ce document sert de feuille de route pour faire passer Life Tracker d'un prototype premium à une application de productivité complète.*

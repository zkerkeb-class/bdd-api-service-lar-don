# WEB SERVICE  - Service dédié aux opérations de base de données

## Description du Service

### Objectif
Développer un service pour gérer toutes les interactions avec la base de données, incluant les requêtes, les mises à jour et la maintenance.

### Fonctionnalités principales
- **Abstraction et gestion des requêtes de base de données.**
- **Mise en place de pratiques de sécurité pour l'accès aux données.**
- **Optimisation des performances des requêtes.**
- **Gérer l'inscription des utilisateurs et toutes les autres opérations nécessitant un stockage en base de données.**

## Membres du projet
- **Lucas SEVAULT**
- **Aubin OLIVRIE**
- **Ryan PEYROT**

## Installation et configuration

1. Exécutez `npm install`.
2. Créez un fichier `.env` avec la configuration suivante :

```env
DBUSER=
DBPASS=
DBCLUSTER=
DATABASE=
PORT=3000
URL_PAYMENT=http://localhost:4005/payments-api
MAILING_API=http://localhost:4003
JWT_SECRET=

```

## Lancement du projet
Exécutez npm start pour lancer le serveur de développement.

# PETAW + ShakurOS Production Strategy

## Objectif

Mettre en production PETAW comme produit utilisateur final, branché exclusivement sur ShakurOS comme API centrale.

PETAW ne doit jamais appeler directement OpenAI, Anthropic, Gemini, DeepSeek, Groq, Mistral, OpenRouter, Ollama ou tout autre provider IA.

## Séparation des produits

- PETAW Web : `C:\Users\hamid\Documents\dev\cncs-systems`
- ShakurOS API : `C:\Users\hamid\Documents\dev\keur Shakur`
- Supabase : auth, données utilisateur, plans, usage, conversations
- Providers IA : secrets côté ShakurOS uniquement

## Architecture cible V1

```text
PETAW Web
  -> Supabase Auth
  -> ShakurOS API Authorization: Bearer <supabase_access_token>
  -> ShakurOS router
  -> Provider IA sélectionné
  -> Usage + quotas + conversations
```

## Environnements

### Local

- PETAW : Vite local
- ShakurOS : `npm run start:api` ou `npm run test:api`
- Supabase : projet cloud actuel
- Objectif : développement rapide et tests manuels

### Staging

- PETAW staging : URL Vercel de préproduction
- ShakurOS staging : service API séparé ou environnement Railway/Fly dédié
- Supabase staging recommandé dès que les premiers utilisateurs testent
- Objectif : valider auth, chat, quotas et fallback avant production

### Production

- PETAW production : domaine public
- ShakurOS production : API stable avec healthcheck
- Supabase production : migrations versionnées, RLS stricte
- Objectif : produit utilisateur fiable, traçable, scalable

## Gates obligatoires avant prod

- PETAW : `npm run build`
- ShakurOS : `npm run test:api`
- Supabase : migrations appliquées et plans `free`, `plus`, `pro`, `enterprise` présents
- Auth : compte utilisateur créé, session Supabase reçue, Bearer transmis à ShakurOS
- Chat : réponse réelle via ShakurOS, sans appel provider depuis PETAW
- Fallback : provider hors token/rate limit -> bascule automatique
- Usage : message, tokens, coût estimé et provider enregistrés

## Ordre d’implémentation propre

1. Stabiliser ShakurOS API
2. Verrouiller auth PETAW -> ShakurOS
3. Persister conversations/messages backend
4. Afficher profil, plan et quotas dans PETAW
5. Ajouter staging séparé
6. Brancher monitoring minimal
7. Déployer production

## Variables critiques

### PETAW

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SHAKUROS_API_URL`

### ShakurOS

- `SHAKUROS_INTERNAL_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PETAW_AUTH_SUPABASE_URL`
- `PETAW_AUTH_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `DEEPSEEK_API_KEY`
- `MISTRAL_API_KEY`
- `OPENROUTER_API_KEY`
- `TOGETHER_API_KEY`
- `FIREWORKS_API_KEY`

## Politique routeur

- Général rapide : Groq en priorité si disponible
- Coding low-cost : DeepSeek en priorité
- Document/vision : Gemini Flash en priorité
- Premium : OpenAI, Claude, Gemini Pro ou Mistral uniquement si nécessaire
- Local : Ollama/LM Studio uniquement en mode local

Si un provider est non configuré, hors quota, rate limited, unauthorized ou en erreur 5xx, ShakurOS doit continuer la chaîne de fallback sans exposer le détail technique à PETAW.

## Décision produit

La mise en production ne doit pas viser une démo jolie. Elle doit livrer une boucle complète :

```text
Utilisateur -> PETAW -> Auth -> ShakurOS -> Router -> Provider -> Fallback -> Usage -> Quota -> Conversation
```

Tant que cette boucle n’est pas stable, on reste en staging.

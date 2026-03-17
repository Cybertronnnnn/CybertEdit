# 🌐 CyberEdit — Guide de Déploiement

## Structure du projet

```
cyberedit/
├── server/
│   └── index.js          ← Backend Express (clé API sécurisée ici)
├── public/
│   └── index.html        ← Frontend complet
├── .env.example          ← Modèle de configuration
├── .gitignore            ← Protège ton .env
├── package.json
├── render.yaml           ← Config Render
└── railway.toml          ← Config Railway
```

---

## 🚀 Déploiement sur Render (recommandé, gratuit)

### Étape 1 — Préparer GitHub
```bash
# Dans le dossier cyberedit/
git init
git add .
git commit -m "🚀 Initial CyberEdit deploy"
```
Crée un repo sur github.com, puis :
```bash
git remote add origin https://github.com/TON_PSEUDO/cyberedit.git
git push -u origin main
```

### Étape 2 — Déployer sur Render
1. Va sur **render.com** → "New Web Service"
2. Connecte ton repo GitHub `cyberedit`
3. Render détecte automatiquement `render.yaml`
4. Dans **Environment Variables**, ajoute :
   - `ANTHROPIC_API_KEY` = `sk-ant-ta-vraie-clé-ici`
5. Clique **Deploy** → ton site est en ligne en ~2 minutes !

---

## 🚂 Déploiement sur Railway

### Étape 1 — Préparer GitHub (même que ci-dessus)

### Étape 2 — Déployer sur Railway
1. Va sur **railway.app** → "New Project"
2. Choisis "Deploy from GitHub repo"
3. Sélectionne ton repo `cyberedit`
4. Dans **Variables**, ajoute :
   - `ANTHROPIC_API_KEY` = `sk-ant-ta-vraie-clé-ici`
5. Railway déploie automatiquement ✅

---

## 💻 Lancer en local (développement)

```bash
# 1. Installer les dépendances
npm install

# 2. Créer ton fichier .env
cp .env.example .env
# Puis édite .env et colle ta clé Anthropic

# 3. Lancer le serveur
npm run dev    # avec rechargement automatique
# ou
npm start      # mode production
```
→ Ouvre http://localhost:3000

---

## 🔑 Obtenir ta clé API Anthropic

1. Va sur **console.anthropic.com**
2. Crée un compte si nécessaire
3. Clique sur "API Keys" → "Create Key"
4. Copie la clé (commence par `sk-ant-...`)
5. ⚠️ Ne la partage JAMAIS, ne la mets JAMAIS dans le code

---

## 🔒 Sécurité

- ✅ La clé API n'est **jamais** envoyée au navigateur
- ✅ Rate limiting : 20 requêtes/minute/IP (anti-abus)
- ✅ `.env` est dans `.gitignore` → jamais sur GitHub
- ✅ Les variables d'environnement Render/Railway sont chiffrées

---

## ⚠️ Coûts API Anthropic

CyberEdit utilise `claude-sonnet-4-20250514`.
Consulte **anthropic.com/pricing** pour les tarifs actuels.
Pour un usage personnel léger, les coûts sont très faibles.

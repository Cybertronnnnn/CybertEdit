require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// ── Rate Limiting (protection anti-abus) ───────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 20,                    // max 20 requêtes/minute/IP
  message: { error: 'Trop de requêtes. Réessayez dans une minute.' }
});
app.use('/api/', limiter);

// ── Vérification clé API ────────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ERREUR : Variable ANTHROPIC_API_KEY manquante dans .env');
  process.exit(1);
}

// ── Route proxy API Anthropic ───────────────────────────────
app.post('/api/claude', async (req, res) => {
  try {
    const { messages, system, max_tokens } = req.body;

    // Validation basique
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Paramètres invalides.' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,   // 🔒 Clé côté serveur uniquement
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1000,
        system,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Erreur API Anthropic' });
    }

    res.json(data);

  } catch (err) {
    console.error('Erreur serveur:', err.message);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// ── Fallback → index.html ───────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Démarrage ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ CyberEdit en ligne sur http://localhost:${PORT}`);
});

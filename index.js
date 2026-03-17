require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const path = require('path');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(express.json({ limit: '20mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// ── Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Trop de requêtes. Réessayez dans une minute.' }
});
app.use('/api/', limiter);

// ── Vérification clés API ───────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ERREUR : Variable ANTHROPIC_API_KEY manquante dans .env');
  process.exit(1);
}

// ── Route proxy Anthropic ───────────────────────────────────
app.post('/api/claude', async (req, res) => {
  try {
    const { messages, system, max_tokens } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Paramètres invalides.' });
    }
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
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

// ── Route Remove.bg — Supprimer le fond ────────────────────
app.post('/api/removebg', async (req, res) => {
  try {
    if (!process.env.REMOVEBG_API_KEY) {
      return res.status(500).json({ error: 'Clé Remove.bg manquante sur le serveur.' });
    }

    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image manquante.' });

    // Convertir base64 en buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    formData.append('image_file', imageBuffer, { filename: 'image.png', contentType: 'image/png' });
    formData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.errors?.[0]?.title || 'Erreur Remove.bg' });
    }

    const buffer = await response.buffer();
    const resultBase64 = 'data:image/png;base64,' + buffer.toString('base64');
    res.json({ result: resultBase64 });

  } catch (err) {
    console.error('Erreur removebg:', err.message);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// ── Route Remove.bg — Nettoyer/Débruiter ──────────────────
app.post('/api/cleanup', async (req, res) => {
  try {
    if (!process.env.REMOVEBG_API_KEY) {
      return res.status(500).json({ error: 'Clé Remove.bg manquante sur le serveur.' });
    }

    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image manquante.' });

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    formData.append('image_file', imageBuffer, { filename: 'image.png', contentType: 'image/png' });
    // Remove.bg avec fond blanc pour effet "nettoyage"
    formData.append('size', 'auto');
    formData.append('bg_color', 'white');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.errors?.[0]?.title || 'Erreur Remove.bg' });
    }

    const buffer = await response.buffer();
    const resultBase64 = 'data:image/png;base64,' + buffer.toString('base64');
    res.json({ result: resultBase64 });

  } catch (err) {
    console.error('Erreur cleanup:', err.message);
    res.status(500).json({ error: 'Erreur interne.' });
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

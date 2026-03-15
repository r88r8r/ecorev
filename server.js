const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/correct', async (req, res) => {
  const { term, ref, userText, maxPts } = req.body;
  if (!term || !userText) return res.status(400).json({ error: 'Données manquantes' });

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Tu es un professeur d'économie de lycée qui corrige des copies.
Terme à définir : "${term}"
Définition de référence : "${ref}"
Réponse de l'élève : "${userText}"
Note cette réponse sur ${maxPts} points selon :
- Présence des notions-clés (${maxPts-1} pts)
- Clarté et formulation (1 pt)
Réponds UNIQUEMENT en JSON strict sans markdown :
{"note":${maxPts},"mention":"Excellent","positifs":"...","manquants":"...","conseil":"..."}`
      }]
    });

    const raw = msg.content[0].text.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur IA', detail: e.message });
  }
});

app.post('/api/correct-eval', async (req, res) => {
  const { question, ref, userText, maxPts } = req.body;
  if (!question || !userText) return res.status(400).json({ error: 'Données manquantes' });

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Professeur d'économie lycée. Question : "${question}" (sur ${maxPts} pts). Réponse attendue : "${ref}". Réponse élève : "${userText}". Note sur ${maxPts}. JSON strict sans markdown : {"note":2,"commentaire":"..."}`
      }]
    });

    const raw = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    parsed.note = Math.min(Math.max(0, parsed.note), maxPts);
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: 'Erreur IA', note: 0, commentaire: 'Correction indisponible.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));

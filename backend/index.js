import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPTS = {
  god: `You are an AI roleplaying as "God" from the Christian Bible.
- Answer only in Romanian.
- Base your answers on the Bible (Old and New Testament).
- When possible, quote or reference Bible verses and then explain them in simple language.
- Always be loving, wise, peaceful and encouraging.
- Do NOT claim you are the real God, say you are just an AI simulation inspired by the Bible.
- Do NOT give harmful, violent, hateful, or illegal advice.`,
  devil: `Ești o voce din Iad, un personaj AI “Devil”.
- Răspunde doar în română.
- Sarcastic, șmecher, umor negru, arogant, nepăsător. Ești cinic și repeți că nu îți pasă de consecințe.
- Nu oferi soluții bune sau morale; minimalizezi problemele și îi dai replici tăioase, nesuferite.
- Îl provoci pe utilizator și îl tachinezi, dar nu încurajezi violență, auto-vătămare sau ilegalități.
- Accent pe tentație, ego, plăceri, scurtături.
- SIGURANȚĂ (obligatoriu):
  - NU încurajezi auto-vătămare, sinucidere, violență, ură sau acțiuni ilegale.
  - NU încurajezi dependențe severe sau vătămare reală.
- Ești un personaj fictiv dintr-o aplicație de joc, nu ești real.`
};

app.post("/api/chat", async (req, res) => {
  const { message, role } = req.body || {};

  if (!message || (role !== "god" && role !== "devil")) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[role] },
        { role: "user", content: message }
      ],
      temperature: role === "devil" ? 0.9 : 0.6
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "";
    return res.json({ reply });
  } catch (err) {
    console.error("OpenAI error", err);
    return res.status(500).json({ error: "Failed to generate reply" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

const fetch = require('node-fetch');
const { config } = require('dotenv');
config();

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const isTesting = process.env.IS_TESTING === 'true';

async function askLLM(question, ocrContext) {
  if (isTesting) {
    return question;
  }

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  const body = {
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'Você é um assistente técnico, conciso e objetivo. Responda em no máximo 4 linhas.' },
      { role: 'user', content: `Pergunta detectada: ${question}\n\nContexto OCR: ${ocrContext.slice(0, 4000)}` }
    ]
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error: ${res.status} ${errText}`);
  }

  const json = await res.json();
  const answer = json.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error('Resposta vazia da API');
  }
  return answer;
}

module.exports = { askLLM };

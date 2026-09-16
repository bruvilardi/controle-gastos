import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Schema } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI categorization route
  app.post('/api/categorize', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Analise a seguinte despesa financeira e extraia os dados.
        O usuário costuma comprar Discos, pedir Delivery (iFood), ir ao Mercado, ou tem gastos Fixos/Outros.
        Extraia o valor (numérico), uma descrição curta e limpa, e a categoria correspondente.
        Se não tiver certeza da categoria, use "Outros".
        
        Texto da despesa: "${text}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              valor: { type: Type.NUMBER, description: 'O custo da despesa em reais. Ex: 150.50' },
              categoria: { type: Type.STRING, description: 'Apenas uma dessas: Discos, Delivery, Mercado, Fixos, Outros' },
              descricao: { type: Type.STRING, description: 'Descrição curta da despesa (ex: Mercado Livre, iFood Pizza, Conta de Luz)' }
            },
            required: ['valor', 'categoria', 'descricao']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error('Gemini error:', error);
      res.status(500).json({ error: 'Falha ao categorizar o gasto automaticamente.', details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

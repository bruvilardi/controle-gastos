import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set. Please add it to your Vercel Environment Variables.");
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
            descricao: { type: Type.STRING, description: 'Descrição curta da despesa' }
          },
          required: ['valor', 'categoria', 'descricao']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Gemini error:', error);
    return res.status(500).json({ error: 'Falha ao categorizar o gasto automaticamente.', details: error.message });
  }
}

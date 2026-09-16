import { GoogleGenAI, Type } from '@google/genai';

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Teste',
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
    console.log(response.text);
  } catch (err) {
    console.error(err);
  }
}
test();

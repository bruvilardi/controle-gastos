import { GoogleGenAI, Type } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: "Say hi"
      });
      console.log(Object.keys(response));
      console.log(response.text);
  } catch(e) {
    console.error(e);
  }
}
test();

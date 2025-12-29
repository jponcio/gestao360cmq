
import { GoogleGenAI } from "@google/genai";
import { DashboardData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGovernmentInsights = async (data: DashboardData) => {
  // Use config.systemInstruction for better context steering.
  // Fixed the error: changed data.indicadores to data.kpis which exists in DashboardData type.
  const prompt = `
    Analise os seguintes dados atuais da Prefeitura de Camaquã:
    - Entregas: ${JSON.stringify(data.entregas)}
    - Indicadores (KPIs): ${JSON.stringify(data.kpis)}
    - Escuta Cidadã: ${JSON.stringify(data.escuta)}

    Forneça 3 insights estratégicos curtos para o Prefeito focando em:
    1. Riscos operacionais iminentes.
    2. Gargalos de validação.
    3. Alinhamento com a opinião pública (Escuta Cidadã).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor sênior de gestão pública. Responda em português de forma executiva e direta.",
        temperature: 0.7,
        topP: 0.8,
      }
    });
    // response.text is a property, not a method.
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return "Não foi possível gerar insights automáticos no momento.";
  }
};

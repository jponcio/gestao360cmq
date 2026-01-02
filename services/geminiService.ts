
import { GoogleGenAI } from "@google/genai";
import { DashboardData, EscutaCidada } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGovernmentInsights = async (data: DashboardData) => {
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
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return "Não foi possível gerar insights automáticos no momento.";
  }
};

export const getTerritoryIntervention = async (demandas: EscutaCidada[]) => {
  const resumo = demandas.map(d => `${d.tema} em ${d.bairro} (${d.status})`).join("; ");
  const prompt = `
    Como consultor de Smart Cities, analise estas demandas reais do território de Camaquã:
    ${resumo}

    Com base no volume e status, sugira UMA intervenção assertiva (ex: mutirão de iluminação, força-tarefa de limpeza ou remanejamento de equipe) e justifique brevemente. 
    Seja curto e prático.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um especialista em logística urbana e gestão territorial municipal.",
        temperature: 0.2,
      }
    });
    return response.text;
  } catch (error) {
    return "Analise os dados para gerar uma sugestão de intervenção.";
  }
};

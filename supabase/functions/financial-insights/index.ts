import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions, recurringContracts, installments, creditCards, creditCardPurchases } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um analista financeiro especializado. Analise os dados financeiros fornecidos e gere insights inteligentes em português. 

Foque em:
1. Padrões de gastos incomuns ou preocupantes
2. Oportunidades de economia com cartões de crédito (uso de limite, parcelamentos, faturas futuras)
3. Tendências positivas ou negativas
4. Sugestões práticas e acionáveis
5. Alertas sobre categorias com gastos crescentes
6. Análise de uso de cartões de crédito e impacto nas finanças
7. Recomendações sobre gestão de parcelamentos e faturas

Seja direto, prático e útil. Forneça no máximo 5 insights mais relevantes.`;

    const userPrompt = `Analise os seguintes dados financeiros:

Transações: ${JSON.stringify(transactions)}
Contratos Recorrentes: ${JSON.stringify(recurringContracts)}
Parcelas: ${JSON.stringify(installments)}
Cartões de Crédito: ${JSON.stringify(creditCards)}
Compras no Cartão: ${JSON.stringify(creditCardPurchases)}

Gere insights inteligentes e sugestões de melhoria, considerando especialmente o uso dos cartões de crédito, limites disponíveis, parcelamentos e faturas futuras.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings -> Workspace -> Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar insights");
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in financial-insights function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

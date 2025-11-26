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
    const { 
      transactions, 
      recurringContracts, 
      installments, 
      creditCards, 
      creditCardPurchases,
      financialStats,
      analysisDate 
    } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um analista financeiro especializado e experiente. Sua função é analisar dados financeiros detalhadamente e fornecer insights profundos, práticos e acionáveis em português brasileiro.

Sua análise deve ser COMPLETA e DETALHADA, incluindo:

1. ANÁLISE COMPARATIVA MENSAL
   - Comparar mês atual vs mês anterior
   - Identificar tendências de crescimento ou redução
   - Calcular variações percentuais precisas
   - Destacar melhorias ou piorias significativas

2. ANÁLISE DE CATEGORIAS DE GASTOS
   - Identificar categorias com maior impacto financeiro
   - Detectar categorias com crescimento preocupante
   - Comparar gastos por categoria entre períodos
   - Sugerir categorias para redução de gastos

3. ANÁLISE DE CARTÕES DE CRÉDITO
   - Avaliar uso de limite disponível
   - Analisar impacto de parcelamentos nas finanças futuras
   - Calcular comprometimento de renda com faturas
   - Alertar sobre risco de endividamento
   - Sugerir estratégias de uso inteligente

4. ANÁLISE DE PARCELAMENTOS
   - Calcular impacto total de parcelas futuras
   - Identificar comprometimento de renda mensal
   - Avaliar se há excesso de parcelamentos
   - Sugerir estratégias de quitação

5. ANÁLISE DE CONTRATOS RECORRENTES
   - Avaliar impacto mensal de contratos fixos
   - Identificar oportunidades de economia
   - Comparar receitas vs despesas recorrentes

6. PROJEÇÕES E ALERTAS
   - Projetar situação financeira para próximos meses
   - Alertar sobre riscos financeiros
   - Identificar padrões preocupantes
   - Destacar oportunidades de economia

7. RECOMENDAÇÕES PRÁTICAS E ACIONÁVEIS
   - Fornecer sugestões específicas e mensuráveis
   - Priorizar ações por impacto
   - Dar metas claras e alcançáveis

FORMATO DA RESPOSTA:
- Use títulos e subtítulos para organizar
- Use números e valores monetários formatados (R$ X.XXX,XX)
- Use porcentagens quando relevante
- Seja específico e detalhado
- Mínimo de 8-10 insights relevantes
- Estruture em seções claras`;

    const { financialStats, analysisDate } = await req.json();
    
    const userPrompt = `Analise COMPLETAMENTE os seguintes dados financeiros (data da análise: ${analysisDate || new Date().toLocaleDateString('pt-BR')}):

=== ESTATÍSTICAS PRÉ-CALCULADAS ===
${JSON.stringify(financialStats, null, 2)}

=== DADOS DETALHADOS ===
Total de Transações: ${transactions.length}
Transações (últimas 100 mais relevantes): ${JSON.stringify(transactions.slice(0, 100).map(t => ({
  data: t.date,
  descricao: t.description,
  valor: t.amount,
  tipo: t.type,
  categoria: t.category
})))}

Contratos Recorrentes Ativos: ${recurringContracts.length}
${JSON.stringify(recurringContracts.filter(c => c.active))}

Parcelas Ativas: ${installments.length}
${JSON.stringify(installments)}

Cartões de Crédito: ${creditCards.length}
${JSON.stringify(creditCards.map(c => ({
  nome: c.name,
  limite: c.limit,
  saldo_atual: c.currentBalance,
  disponivel: c.limit - c.currentBalance,
  uso_percentual: ((c.currentBalance / c.limit) * 100).toFixed(1) + '%'
})))}

Compras no Cartão: ${creditCardPurchases.length}
${JSON.stringify(creditCardPurchases.slice(0, 50))}

=== INSTRUÇÕES ===
Com base em TODOS esses dados, forneça uma análise COMPLETA, DETALHADA e PROFUNDA. 
- Use os valores das estatísticas pré-calculadas para fazer comparações precisas
- Identifique padrões, tendências e anomalias
- Forneça insights acionáveis e específicos
- Seja quantitativo (use números, valores, porcentagens)
- Estruture a resposta em seções organizadas
- Mínimo de 8-10 insights relevantes e detalhados`;

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

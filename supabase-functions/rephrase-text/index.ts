import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer le texte depuis la requête
    const { text, style = 'professional' } = await req.json()
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Configuration OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    // Styles de reformulation disponibles
    const stylePrompts = {
      professional: "Rewrite this text in a professional, formal tone suitable for business communication.",
      casual: "Rewrite this text in a casual, friendly tone for informal communication.",
      academic: "Rewrite this text in an academic, scholarly tone with proper structure and terminology.",
      creative: "Rewrite this text in a creative, engaging way that captures attention.",
      concise: "Rewrite this text to be more concise and to the point while maintaining all key information.",
      detailed: "Rewrite this text with more detail and explanation to provide comprehensive information."
    }

    const selectedStyle = stylePrompts[style] || stylePrompts.professional

    // Appel à l'API OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a text rephrasing expert. Your task is to rewrite the given text according to the specified style while maintaining the original meaning and intent.
            
            Guidelines:
            - Maintain the original meaning and intent
            - Follow the specified style and tone
            - Keep the same length approximately
            - Ensure clarity and readability
            - Preserve any important details or facts
            - Return only the rephrased text, no explanations`
          },
          {
            role: 'user',
            content: `${selectedStyle}\n\nOriginal text: ${text}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const rephrasedText = openaiData.choices[0]?.message?.content

    if (!rephrasedText) {
      throw new Error('No rephrased text received from OpenAI')
    }

    // Retourner la réponse
    return new Response(
      JSON.stringify({ 
        rephrased_text: rephrasedText,
        original_text: text,
        style_used: style,
        model_used: 'gpt-4o-mini'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in rephrase-text function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

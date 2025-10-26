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
    // Récupérer le texte et les options depuis la requête
    const { text, options = {} } = await req.json()
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extraire les paramètres des options (frontend envoie: type, tone, length, corrections)
    const type = options.type || 'professional'
    const tone = options.tone || 'neutral'
    const length = options.length || 'same'
    const corrections = options.corrections || 'all'

    // Configuration OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    // Build dynamic system prompt based on options
    const typePrompts = {
      professional: 'professional and formal tone',
      casual: 'casual and friendly tone',
      formal: 'highly formal and academic tone',
      simple: 'simple and straightforward tone'
    }
    
    const tonePrompts = {
      neutral: 'balanced and neutral tone',
      friendly: 'warm and friendly tone',
      assertive: 'confident and assertive tone',
      persuasive: 'persuasive and compelling tone'
    }
    
    const lengthPrompts = {
      shorter: 'Make it shorter and more concise',
      same: 'Keep approximately the same length',
      longer: 'Expand with more detail'
    }
    
    const correctionPrompt = corrections === 'all' ? 'Correct all grammar and spelling errors'
                           : corrections === 'grammar' ? 'Focus on grammar corrections'
                           : corrections === 'spelling' ? 'Focus on spelling corrections'
                           : 'Minimal corrections, maintain original style'

    const systemPrompt = `You are a text rephrasing expert. Rephrase the following text with:
- Style: ${typePrompts[type] || typePrompts.professional}
- Tone: ${tonePrompts[tone] || tonePrompts.neutral}
- Length: ${lengthPrompts[length] || lengthPrompts.same}
- Corrections: ${correctionPrompt}

Maintain the original meaning and intent. Return only the rephrased text, no explanations.`

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
            content: 'You are a professional text rephrasing assistant.'
          },
          {
            role: 'user',
            content: `${systemPrompt}\n\nOriginal text:\n${text}`
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
        options_used: { type, tone, length, corrections },
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

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

    // Extraire les paramètres des options (frontend envoie: goal, audience, detail, format)
    const goal = options.goal || 'informative'
    const audience = options.audience || 'general'
    const detail = options.detail || 'balanced'
    const format = options.format || 'paragraph'

    // Configuration OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    // Build dynamic system prompt based on options
    const goalPrompts = {
      informative: 'make this prompt more informative and comprehensive',
      creative: 'make this prompt more creative and engaging',
      analytical: 'make this prompt more analytical and detailed',
      technical: 'make this prompt more technical and precise'
    }
    
    const audiencePrompts = {
      general: 'suitable for a general audience',
      expert: 'suitable for expert-level audience',
      beginner: 'suitable for beginners',
      technical: 'suitable for technical users'
    }
    
    const detailPrompts = {
      concise: 'more concise and direct',
      balanced: 'balanced level of detail',
      detailed: 'more detailed and comprehensive'
    }
    
    const formatPrompts = {
      paragraph: 'in paragraph format',
      bullet: 'in bullet point format',
      numbered: 'in numbered list format'
    }

    const systemPrompt = `${goalPrompts[goal] || goalPrompts.informative}, 
${audiencePrompts[audience] || audiencePrompts.general}, 
${detailPrompts[detail] || detailPrompts.balanced}, 
${formatPrompts[format] || formatPrompts.paragraph}.
Make it more clear, specific, and effective. Return only the enhanced prompt, no explanations.`

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
            content: 'You are a prompt enhancement expert.'
          },
          {
            role: 'user',
            content: `${systemPrompt}\n\nOriginal prompt:\n${text}`
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
    const enhancedText = openaiData.choices[0]?.message?.content

    if (!enhancedText) {
      throw new Error('No enhanced text received from OpenAI')
    }

    // Retourner la réponse
    return new Response(
      JSON.stringify({ 
        enhanced_text: enhancedText,
        original_text: text,
        options_used: { goal, audience, detail, format },
        model_used: 'gpt-4o-mini'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in enhance-prompt function:', error)
    
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

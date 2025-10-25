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
    // Récupérer le texte et la langue cible depuis la requête
    const { text, target_language = 'English', source_language = 'auto' } = await req.json()
    
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
            content: `You are a professional translator. Your task is to translate the given text from ${source_language} to ${target_language}.
            
            Guidelines:
            - Provide accurate and natural translation
            - Maintain the original tone and style
            - Preserve formatting and structure when possible
            - If the source language is 'auto', detect it automatically
            - Return only the translated text, no explanations
            - If the text is already in the target language, return it as is`
          },
          {
            role: 'user',
            content: `Translate this text to ${target_language}:\n\n${text}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent translations
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const translatedText = openaiData.choices[0]?.message?.content

    if (!translatedText) {
      throw new Error('No translated text received from OpenAI')
    }

    // Retourner la réponse
    return new Response(
      JSON.stringify({ 
        translated_text: translatedText,
        original_text: text,
        source_language: source_language,
        target_language: target_language,
        model_used: 'gpt-4o-mini'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in translate-text function:', error)
    
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

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
    // Récupérer les données audio et les paramètres depuis la requête
    const { audio_data, action = 'transcribe', language = 'auto' } = await req.json()
    
    if (!audio_data) {
      return new Response(
        JSON.stringify({ error: 'Audio data is required' }),
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

    let result;

    if (action === 'transcribe') {
      // Transcription audio en texte
      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: createFormData(audio_data, 'audio.m4a', language)
      })

      if (!transcriptionResponse.ok) {
        const errorData = await transcriptionResponse.json()
        throw new Error(`Transcription error: ${transcriptionResponse.status} - ${errorData.error?.message}`)
      }

      const transcriptionData = await transcriptionResponse.json()
      result = {
        type: 'transcription',
        text: transcriptionData.text,
        language: language
      }

    } else if (action === 'analyze') {
      // Analyse du contenu vocal avec IA
      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are a voice content analyzer. Analyze the transcribed voice content and provide insights about:
              - Main topics discussed
              - Key points and action items
              - Sentiment and tone
              - Suggestions for improvement
              - Summary of the content
              
              Provide a structured analysis in JSON format.`
            },
            {
              role: 'user',
              content: `Analyze this voice content: ${audio_data}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      })

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json()
        throw new Error(`Analysis error: ${analysisResponse.status}`)
      }

      const analysisData = await analysisResponse.json()
      result = {
        type: 'analysis',
        analysis: analysisData.choices[0]?.message?.content,
        language: language
      }

    } else {
      throw new Error('Invalid action. Supported actions: transcribe, analyze')
    }

    // Retourner la réponse
    return new Response(
      JSON.stringify({ 
        ...result,
        action_performed: action,
        model_used: 'gpt-4o-mini',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in voice-processing function:', error)
    
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

// Helper function to create FormData for audio upload
function createFormData(audioData: string, filename: string, language: string): FormData {
  const formData = new FormData()
  
  // Convert base64 audio data to blob
  const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], {
    type: 'audio/m4a'
  })
  
  formData.append('file', audioBlob, filename)
  formData.append('model', 'whisper-1')
  formData.append('language', language === 'auto' ? '' : language)
  formData.append('response_format', 'json')
  
  return formData
}

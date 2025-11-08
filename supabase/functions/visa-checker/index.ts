import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nationality, destination } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Checking visa requirements for:', { nationality, destination });

    const systemPrompt = `You are an expert visa and travel documentation advisor with up-to-date knowledge of international visa requirements, entry policies, and travel documentation.
    
    Provide accurate, current visa information including:
    - Visa requirement status (Visa Required, Visa on Arrival, eVisa, Visa-free, etc.)
    - Processing time and validity period
    - Required documents
    - Application process steps
    - Estimated costs
    - Important notes and restrictions
    - Official embassy/consulate information`;

    const userPrompt = `Provide detailed visa requirements for:
    - Traveler Nationality: ${nationality}
    - Destination Country: ${destination}
    
    Include visa status, application process, required documents, processing time, costs, and any important travel advisories or entry requirements.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_visa_information',
              description: 'Return detailed visa requirement information',
              parameters: {
                type: 'object',
                properties: {
                  visaRequired: { 
                    type: 'string', 
                    description: 'Visa status: Visa Required, Visa on Arrival, eVisa, Visa-free, etc.' 
                  },
                  processingTime: { 
                    type: 'string', 
                    description: 'Time required to process visa application' 
                  },
                  validityPeriod: { 
                    type: 'string', 
                    description: 'How long the visa is valid for' 
                  },
                  estimatedCost: { 
                    type: 'string', 
                    description: 'Approximate visa cost in USD' 
                  },
                  requiredDocuments: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of required documents for visa application'
                  },
                  applicationProcess: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Step-by-step application process'
                  },
                  importantNotes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Important restrictions, requirements, or advisories'
                  },
                  officialWebsite: { 
                    type: 'string', 
                    description: 'Official embassy or immigration website URL' 
                  }
                },
                required: ['visaRequired', 'processingTime', 'validityPeriod', 'estimatedCost', 'requiredDocuments', 'applicationProcess', 'importantNotes'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_visa_information' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('Failed to get visa information from AI');
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const visaInfo = JSON.parse(toolCall.function.arguments);
      console.log('Visa information retrieved:', visaInfo);
      
      return new Response(
        JSON.stringify(visaInfo),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('No visa information returned from AI');

  } catch (error) {
    console.error('Error in visa-checker function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

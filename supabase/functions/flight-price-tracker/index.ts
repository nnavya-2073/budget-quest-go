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
    const { from, to, departureDate, returnDate } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Tracking flight prices for:', { from, to, departureDate, returnDate });

    const systemPrompt = `You are an expert flight pricing analyst with knowledge of airline pricing patterns, seasonal variations, and booking strategies.
    
    Provide realistic flight price estimates and recommendations including:
    - Current estimated price ranges
    - Best time to book for optimal prices
    - Price trends (rising, falling, stable)
    - Budget airlines vs premium carriers
    - Booking recommendations and tips`;

    const userPrompt = `Provide flight price analysis for:
    - From: ${from}
    - To: ${to}
    - Departure: ${departureDate}
    ${returnDate ? `- Return: ${returnDate}` : '- One-way trip'}
    
    Include current price estimates, booking recommendations, price trends, and money-saving tips.`;

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
              name: 'provide_flight_price_info',
              description: 'Return flight price estimates and recommendations',
              parameters: {
                type: 'object',
                properties: {
                  estimatedPrice: {
                    type: 'object',
                    properties: {
                      min: { type: 'number', description: 'Minimum estimated price in INR' },
                      max: { type: 'number', description: 'Maximum estimated price in INR' },
                      average: { type: 'number', description: 'Average estimated price in INR' }
                    },
                    description: 'Price range estimates'
                  },
                  priceLevel: {
                    type: 'string',
                    description: 'Current price level: Low, Medium, High, or Very High'
                  },
                  trend: {
                    type: 'string',
                    description: 'Price trend: Rising, Falling, or Stable'
                  },
                  bestTimeToBook: {
                    type: 'string',
                    description: 'Recommended booking timeframe for best prices'
                  },
                  airlines: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        type: { type: 'string', description: 'Budget or Premium' },
                        estimatedPrice: { type: 'number' }
                      }
                    },
                    description: 'Airlines operating on this route with estimates'
                  },
                  savingTips: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Money-saving tips for this route'
                  },
                  bookingRecommendations: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'When and how to book for best results'
                  }
                },
                required: ['estimatedPrice', 'priceLevel', 'trend', 'bestTimeToBook', 'airlines', 'savingTips', 'bookingRecommendations'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_flight_price_info' } }
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
      throw new Error('Failed to get flight price information from AI');
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const priceInfo = JSON.parse(toolCall.function.arguments);
      console.log('Flight price information retrieved:', priceInfo);
      
      return new Response(
        JSON.stringify(priceInfo),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('No flight price information returned from AI');

  } catch (error) {
    console.error('Error in flight-price-tracker function:', error);
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

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
    const { budget, duration, mood, cuisine, departureCity, surpriseMe, travelMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating recommendations for:', { budget, duration, mood, cuisine, departureCity, surpriseMe, travelMode });

    // Create detailed prompt for AI
    const travelModeText = travelMode === 'any' ? 'Consider the best travel mode (flight/train/car) for each destination' : `User prefers traveling by ${travelMode}`;
    
    const systemPrompt = `You are an expert travel advisor specializing in budget-optimized travel planning for India. 
    Your task is to recommend 3-5 diverse travel destinations based on the user's preferences.
    
    For each destination, provide:
    - City name (not just the tourist spot, but the actual city/town)
    - State
    - Category (Adventure, Beach, Culture, Nature, etc.)
    - Estimated total cost (within budget)
    - Trip duration
    - Rating (4.0-5.0)
    - Brief description (1-2 sentences)
    - Top 3-5 restaurant recommendations
    - Approximate distance from departure city in kilometers
    - Estimated travel duration from departure city (e.g., "2 hours by flight", "8 hours by train", "5 hours by car")
    - Day-by-day itinerary with 3-4 activities per day
    - 3-5 practical budget-saving tips specific to this destination
    - Weather information: climate type and average temperature range
    - Best time to visit (months)
    - Coordinates (latitude and longitude) for map display
    
    Consider real travel costs including accommodation, food, local transport, and activities.
    ${travelModeText}.
    ${surpriseMe ? 'IMPORTANT: User wants RANDOM and UNEXPECTED destinations! Pick diverse, lesser-known, and surprising places that most tourists might not consider. Be creative and adventurous with your recommendations!' : 'Ensure recommendations match the user\'s mood and cuisine preferences.'}
    Make cost estimates realistic for Indian travel.
    Calculate realistic distances and travel times between Indian cities.`;

    const userPrompt = surpriseMe 
      ? `Find RANDOM and SURPRISING travel destinations for an adventurous traveler:
    - Departure City: ${departureCity}
    - Budget: ₹${budget}
    - Duration: ${duration}
    - Travel Mode: ${travelMode === 'any' ? 'Optimize for best option' : travelMode}
    
    IMPORTANT: Recommend unexpected, offbeat, and lesser-known destinations! Think beyond typical tourist spots.
    Include hidden gems, unusual places, and destinations with unique experiences.
    For each destination, include the distance, travel duration from ${departureCity}, a detailed day-by-day itinerary, budget-saving tips, weather info, best time to visit, and exact coordinates.`
      : `Find perfect travel destinations for:
    - Departure City: ${departureCity}
    - Budget: ₹${budget}
    - Duration: ${duration}
    - Mood: ${mood}
    - Cuisine preference: ${cuisine}
    - Travel Mode: ${travelMode === 'any' ? 'Optimize for best option' : travelMode}
    
    Return diverse destinations that match these criteria and provide a balanced mix of experiences.
    For each destination, include the distance, travel duration from ${departureCity}, a detailed day-by-day itinerary, budget-saving tips, weather info, best time to visit, and exact coordinates.`;

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
              name: 'recommend_destinations',
              description: 'Return 3-5 travel destination recommendations',
              parameters: {
                type: 'object',
                properties: {
                  destinations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        city: { type: 'string', description: 'City/town name of the destination' },
                        name: { type: 'string', description: 'Tourist destination or area name' },
                        state: { type: 'string', description: 'State in India' },
                        category: { type: 'string', description: 'Type of destination' },
                        cost: { type: 'number', description: 'Total estimated cost in INR' },
                        duration: { type: 'string', description: 'Recommended trip duration' },
                        rating: { type: 'number', description: 'Rating out of 5' },
                        description: { type: 'string', description: 'Brief compelling description' },
                        restaurants: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Top restaurant names'
                        },
                        distance: { type: 'number', description: 'Distance from departure city in kilometers' },
                        travelDuration: { type: 'string', description: 'Estimated travel time from departure city' },
                        itinerary: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              day: { type: 'number', description: 'Day number' },
                              activities: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Activities for this day'
                              }
                            }
                          },
                          description: 'Day-by-day itinerary'
                        },
                        budgetTips: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Money-saving tips for this destination'
                        },
                        weather: {
                          type: 'object',
                          properties: {
                            climate: { type: 'string', description: 'Climate type (e.g., Tropical, Temperate)' },
                            avgTemp: { type: 'string', description: 'Average temperature range' }
                          },
                          description: 'Weather information'
                        },
                        bestTime: { 
                          type: 'string', 
                          description: 'Best months to visit (e.g., October-March)' 
                        },
                        coordinates: {
                          type: 'object',
                          properties: {
                            lat: { type: 'number', description: 'Latitude' },
                            lng: { type: 'number', description: 'Longitude' }
                          },
                          description: 'Geographic coordinates'
                        }
                      },
                      required: ['city', 'name', 'state', 'category', 'cost', 'duration', 'rating', 'description', 'restaurants', 'distance', 'travelDuration', 'itinerary', 'budgetTips', 'weather', 'bestTime', 'coordinates'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['destinations'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'recommend_destinations' } }
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
      throw new Error('Failed to get recommendations from AI');
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data, null, 2));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const recommendations = JSON.parse(toolCall.function.arguments);
      console.log('Parsed recommendations:', recommendations);
      
      return new Response(
        JSON.stringify(recommendations),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('No recommendations returned from AI');

  } catch (error) {
    console.error('Error in travel-recommendations function:', error);
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

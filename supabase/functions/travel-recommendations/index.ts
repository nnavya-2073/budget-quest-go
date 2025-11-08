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
    const { budget, duration, mood, cuisine, departureCity, destinationCity, surpriseMe, travelMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating recommendations for:', { budget, duration, mood, cuisine, departureCity, destinationCity, surpriseMe, travelMode });

    // Create detailed prompt for AI
    const travelModeText = travelMode === 'any' ? 'Consider the best travel mode (flight/train/car) for each destination' : `User prefers traveling by ${travelMode}`;
    
    const systemPrompt = `You are an expert travel advisor specializing in budget-optimized travel planning worldwide. 
    Your task is to recommend 3-5 diverse travel destinations (both domestic Indian and international) based on the user's preferences.
    
    For each destination, provide:
    - City name (not just the tourist spot, but the actual city/town)
    - State/Province/Region and Country (for international destinations, clearly mention the country)
    - Category (Adventure, Beach, Culture, Nature, etc.)
    - Estimated total cost (within budget, in INR - convert international costs to INR)
    - Trip duration
    - Rating (4.0-5.0)
    - Brief description (1-2 sentences)
    - Image URL (use a realistic placeholder or describe the place for image generation)
    - Top 5 restaurant recommendations with ratings (4.0-5.0) and price range in local currency + INR equivalent
    - Top 5 hotel recommendations with ratings (3.5-5.0), price per night in local currency + INR equivalent, and amenities
    - Top 10 activities with descriptions, ratings (4.0-5.0), and estimated costs in local currency + INR equivalent
    - Approximate distance from departure city in kilometers
    - Estimated travel duration from departure city (e.g., "8 hours by flight", "2 hours by train")
    - Travel options: detailed flight/train/bus/car options with estimated costs in INR and duration for each mode
    - Day-by-day itinerary with 3-4 activities per day
    - 3-5 practical budget-saving tips specific to this destination
    - Weather information: climate type and average temperature range
    - Best time to visit (months)
    - Seasonal pricing variations (e.g., "Peak season: Dec-Feb (+30%), Off-season: Jun-Aug (-20%)")
    - Coordinates (latitude and longitude) for map display
    - For international destinations: visa requirements, currency information, and entry requirements
    
    Consider real travel costs including accommodation, food, local transport, activities, and international flights.
    ${travelModeText}.
    ${surpriseMe ? 'IMPORTANT: User wants RANDOM and UNEXPECTED destinations! Pick diverse, lesser-known, and surprising places worldwide that most tourists might not consider. Be creative and adventurous with your recommendations!' : 'Ensure recommendations match the user\'s mood and cuisine preferences.'}
    Make cost estimates realistic. Convert all costs to INR for easy comparison.
    Calculate realistic distances and travel times between cities worldwide.`;

    const destinationFilter = destinationCity ? `- Preferred Destination: ${destinationCity} (prioritize this if it matches criteria)` : '';
    
    const userPrompt = surpriseMe 
      ? `Find RANDOM and SURPRISING travel destinations for an adventurous traveler:
    - Departure City: ${departureCity}
    ${destinationFilter}
    - Budget: ₹${budget}
    - Duration: ${duration}
    - Travel Mode: ${travelMode === 'any' ? 'Optimize for best option' : travelMode}
    
    IMPORTANT: Recommend unexpected, offbeat, and lesser-known destinations! Think beyond typical tourist spots.
    Include hidden gems, unusual places, and destinations with unique experiences.
    For each destination, include hotels, restaurants, activities (all with ratings and reviews), travel options, seasonal pricing, a detailed day-by-day itinerary, budget-saving tips, weather info, best time to visit, and exact coordinates.`
      : `Find perfect travel destinations for:
    - Departure City: ${departureCity}
    ${destinationFilter}
    - Budget: ₹${budget}
    - Duration: ${duration}
    - Mood: ${mood}
    - Cuisine preference: ${cuisine}
    - Travel Mode: ${travelMode === 'any' ? 'Optimize for best option' : travelMode}
    
    Return diverse destinations that match these criteria and provide a balanced mix of experiences.
    For each destination, include top hotels, restaurants, activities (all with ratings, reviews, and prices), detailed travel options (flight/train/bus/car with costs), seasonal pricing variations, a detailed day-by-day itinerary, budget-saving tips, weather info, best time to visit, and exact coordinates.`;

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
                        imageUrl: { type: 'string', description: 'Image URL or description for the destination' },
                        restaurants: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              rating: { type: 'number' },
                              priceRange: { type: 'string', description: 'e.g., ₹₹ or ₹₹₹' },
                              cuisine: { type: 'string' }
                            }
                          },
                          description: 'Top 5 restaurants with ratings'
                        },
                        hotels: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              rating: { type: 'number' },
                              pricePerNight: { type: 'number' },
                              amenities: { type: 'array', items: { type: 'string' } },
                              imageUrl: { type: 'string' }
                            }
                          },
                          description: 'Top 5 hotels with details'
                        },
                        activities: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              description: { type: 'string' },
                              rating: { type: 'number' },
                              cost: { type: 'number' },
                              imageUrl: { type: 'string' }
                            }
                          },
                          description: 'Top 10 activities with details'
                        },
                        distance: { type: 'number', description: 'Distance from departure city in kilometers' },
                        travelDuration: { type: 'string', description: 'Estimated travel time from departure city' },
                        travelOptions: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              mode: { type: 'string', description: 'flight, train, bus, or car' },
                              duration: { type: 'string' },
                              cost: { type: 'number' },
                              details: { type: 'string' }
                            }
                          },
                          description: 'Detailed travel options with costs'
                        },
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
                        seasonalPricing: { 
                          type: 'string', 
                          description: 'Price variations by season (e.g., Peak: +30%, Off-season: -20%)' 
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
                      required: ['city', 'name', 'state', 'category', 'cost', 'duration', 'rating', 'description', 'imageUrl', 'restaurants', 'hotels', 'activities', 'distance', 'travelDuration', 'travelOptions', 'itinerary', 'budgetTips', 'weather', 'bestTime', 'seasonalPricing', 'coordinates'],
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

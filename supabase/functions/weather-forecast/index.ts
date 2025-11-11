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
    const { city, days = 7 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Fetching weather forecast for:', city);

    const systemPrompt = `You are a weather information assistant. Provide realistic weather forecasts based on the destination's typical climate patterns and current season.
    
    Return accurate weather data including:
    - Current weather conditions
    - Temperature (in Celsius)
    - Weather description
    - 7-day forecast with daily highs/lows
    - Humidity percentage
    - Wind speed
    - Weather icons/conditions
    
    Base your predictions on known climate patterns for the region.`;

    const userPrompt = `Provide a detailed ${days}-day weather forecast for ${city}. Include:
    1. Current weather with temperature, condition, humidity, wind speed
    2. Daily forecast for the next ${days} days with:
       - Date
       - High and low temperatures in Celsius
       - Weather condition (Clear, Cloudy, Rainy, Sunny, etc.)
       - Short description
       - Chance of precipitation
    
    Make the forecast realistic based on the location's typical climate and current season.`;

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
              name: 'get_weather_forecast',
              description: 'Return weather forecast data',
              parameters: {
                type: 'object',
                properties: {
                  current: {
                    type: 'object',
                    properties: {
                      temp: { type: 'number', description: 'Current temperature in Celsius' },
                      condition: { type: 'string', description: 'Weather condition (Clear, Cloudy, Rainy, etc.)' },
                      description: { type: 'string', description: 'Detailed weather description' },
                      humidity: { type: 'number', description: 'Humidity percentage' },
                      windSpeed: { type: 'number', description: 'Wind speed in km/h' },
                      feelsLike: { type: 'number', description: 'Feels like temperature' }
                    },
                    required: ['temp', 'condition', 'description', 'humidity', 'windSpeed', 'feelsLike']
                  },
                  forecast: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
                        dayOfWeek: { type: 'string', description: 'Day of the week' },
                        high: { type: 'number', description: 'High temperature in Celsius' },
                        low: { type: 'number', description: 'Low temperature in Celsius' },
                        condition: { type: 'string', description: 'Weather condition' },
                        description: { type: 'string', description: 'Short description' },
                        precipitation: { type: 'number', description: 'Chance of precipitation (0-100)' }
                      },
                      required: ['date', 'dayOfWeek', 'high', 'low', 'condition', 'description', 'precipitation']
                    },
                    description: `${days} day forecast`
                  },
                  location: {
                    type: 'object',
                    properties: {
                      city: { type: 'string' },
                      country: { type: 'string' }
                    },
                    required: ['city', 'country']
                  }
                },
                required: ['current', 'forecast', 'location'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'get_weather_forecast' } }
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
      throw new Error('Failed to get weather forecast from AI');
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const weatherData = JSON.parse(toolCall.function.arguments);
      console.log('Parsed weather data:', weatherData);
      
      return new Response(
        JSON.stringify(weatherData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('No weather data returned from AI');

  } catch (error) {
    console.error('Error in weather-forecast function:', error);
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

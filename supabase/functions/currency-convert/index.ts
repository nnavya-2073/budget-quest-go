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
    const { amount, from, to } = await req.json();
    
    console.log('Converting currency:', { amount, from, to });

    // Using exchangerate-api.io (free tier)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    const rate = data.rates[to];
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${to}`);
    }

    const convertedAmount = amount * rate;

    return new Response(
      JSON.stringify({ 
        amount,
        from,
        to,
        rate,
        convertedAmount,
        lastUpdated: data.date
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in currency-convert function:', error);
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

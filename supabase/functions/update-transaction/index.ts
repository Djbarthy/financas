// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transactionId, updates } = await req.json()

    if (!transactionId || !updates) {
      throw new Error("O ID da transação e os dados de atualização são obrigatórios.");
    }

    const updatesForDb: { [key: string]: any } = {};
    for (const key in updates) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      updatesForDb[snakeKey] = updates[key];
    }
    
    updatesForDb.updated_at = new Date().toISOString();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .update(updatesForDb)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar transação no Supabase:', error);
      throw error
    }

    return new Response(JSON.stringify({ transaction: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Erro no catch:', err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 
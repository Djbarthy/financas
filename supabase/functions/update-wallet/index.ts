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
    const { walletId, updates } = await req.json()

    if (!walletId || !updates) {
      throw new Error("O ID da carteira e os dados de atualização são obrigatórios.");
    }

    // Converte as chaves de camelCase para snake_case para o DB
    const updatesForDb: { [key: string]: any } = {};
    for (const key in updates) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      updatesForDb[snakeKey] = updates[key];
    }

    // Garante que o updatedAt seja atualizado
    updatesForDb.updated_at = new Date().toISOString();


    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseAdmin
      .from('wallets')
      .update(updatesForDb)
      .eq('id', walletId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar carteira no Supabase:', error);
      throw error
    }

    return new Response(JSON.stringify({ wallet: data }), {
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
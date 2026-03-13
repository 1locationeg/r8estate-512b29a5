import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization")!;
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: isAdmin } = await anonClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to list auth users
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers({
      perPage: 500,
    });
    if (listError) throw listError;

    // Fetch all roles
    const { data: roles } = await adminClient.from("user_roles").select("user_id, role");
    const roleMap: Record<string, string[]> = {};
    for (const r of roles || []) {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    }

    // Fetch profiles for names
    const { data: profiles } = await adminClient.from("profiles").select("user_id, full_name, avatar_url");
    const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    for (const p of profiles || []) {
      profileMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
    }

    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      full_name: profileMap[u.id]?.full_name || u.user_metadata?.full_name || null,
      avatar_url: profileMap[u.id]?.avatar_url || null,
      roles: roleMap[u.id] || [],
      created_at: u.created_at,
    }));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

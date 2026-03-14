import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const user = { id: userId };

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

    // Fetch admin permissions
    const { data: adminPerms } = await adminClient.from("admin_permissions").select("user_id, permission_level");
    const permMap: Record<string, string> = {};
    for (const ap of adminPerms || []) {
      permMap[ap.user_id] = ap.permission_level;
    }

    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      full_name: profileMap[u.id]?.full_name || u.user_metadata?.full_name || null,
      avatar_url: profileMap[u.id]?.avatar_url || null,
      roles: roleMap[u.id] || [],
      admin_permission: permMap[u.id] || null,
      created_at: u.created_at,
    }));

    // Also return the caller's permission level
    const callerPermission = permMap[user.id] || null;

    return new Response(JSON.stringify({ users: result, callerPermission }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

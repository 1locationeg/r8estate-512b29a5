import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefirmToken: false, persistSession: false },
    });

    const testUsers = [
      {
        email: "buyer@r8test.com",
        password: "R8Test2026!",
        fullName: "Test Buyer",
        accountType: "buyer",
      },
      {
        email: "business@r8test.com",
        password: "R8Test2026!",
        fullName: "Test Business",
        accountType: "business",
      },
      {
        email: "admin@r8test.com",
        password: "R8Test2026!",
        fullName: "Test Admin",
        accountType: "buyer",
      },
    ];

    const results = [];

    for (const u of testUsers) {
      // Check if user already exists
      const { data: existingUsers } = await admin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(
        (user) => user.email === u.email
      );

      if (existing) {
        results.push({ email: u.email, status: "already_exists", id: existing.id });
        continue;
      }

      // Create user with email confirmed
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          full_name: u.fullName,
          account_type: u.accountType,
        },
      });

      if (error) {
        results.push({ email: u.email, status: "error", error: error.message });
        continue;
      }

      results.push({ email: u.email, status: "created", id: data.user.id });

      // For admin user, assign admin role
      if (u.email === "admin@r8test.com" && data.user) {
        await admin
          .from("user_roles")
          .insert({ user_id: data.user.id, role: "admin" });
        // Also add super_admin permission
        await admin
          .from("admin_permissions")
          .insert({
            user_id: data.user.id,
            permission_level: "super_admin",
          });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

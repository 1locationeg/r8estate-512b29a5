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
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find follows older than 6 months that haven't been reminded
    const { data: staleFollows, error: fetchErr } = await supabase
      .from("followed_businesses")
      .select("id, user_id, business_id, business_name, created_at")
      .is("follow_reminded_at", null)
      .lt("created_at", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

    if (fetchErr) throw fetchErr;
    if (!staleFollows || staleFollows.length === 0) {
      return new Response(JSON.stringify({ reminded: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let reminded = 0;

    for (const follow of staleFollows) {
      // Check if user already reviewed this developer
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", follow.user_id)
        .eq("developer_id", follow.business_id)
        .limit(1)
        .maybeSingle();

      if (existingReview) {
        // Already reviewed — mark as reminded to skip next time
        await supabase
          .from("followed_businesses")
          .update({ follow_reminded_at: new Date().toISOString() })
          .eq("id", follow.id);
        continue;
      }

      // Send notification
      const { error: notifErr } = await supabase.rpc("create_notification", {
        _user_id: follow.user_id,
        _type: "review",
        _title: `📋 ${follow.business_name} — Share Your Experience`,
        _message: `You've been tracking ${follow.business_name} for 6 months. Your review helps thousands of buyers make confident decisions!`,
        _metadata: {
          developer_id: follow.business_id,
          developer_name: follow.business_name,
          link: `/reviews?developer=${follow.business_id}`,
        },
      });

      if (!notifErr) {
        await supabase
          .from("followed_businesses")
          .update({ follow_reminded_at: new Date().toISOString() })
          .eq("id", follow.id);
        reminded++;
      }
    }

    return new Response(JSON.stringify({ reminded }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

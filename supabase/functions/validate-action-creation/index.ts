import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    const body = await req.json();
    const { name, short, category, description, is_active, action_id, attributes } = body;

    const errors: string[] = [];
    const warnings: string[] = [];

    // ── Validate basic fields ─────────────────────────────────────────
    if (!name || typeof name !== "string" || !name.trim()) {
      errors.push("Action name is required.");
    }

    if (!short || typeof short !== "string" || !short.trim()) {
      errors.push("Action Short is required.");
    } else if (!/^[a-z][a-z0-9_]*$/.test(short)) {
      errors.push("Action Short must be lowercase letters and underscores only.");
    } else {
      // Check uniqueness (skip if action_id provided = update)
      const q = supabase.from("tc_action_library").select("id").eq("action_key", short);
      if (action_id) q.neq("id", action_id);
      const { data: existing } = await q.maybeSingle();
      if (existing) {
        errors.push(`Action Short "${short}" is already taken.`);
      }
    }

    if (!category || typeof category !== "string" || !category.trim()) {
      errors.push("Category is required.");
    }

    // ── Validate attributes (optional) ────────────────────────────────
    if (attributes) {
      // WHO: validate workers exist
      if (attributes.who?.workerIds?.length > 0) {
        const { data: workers, error: wErr } = await supabase
          .from("tc_users")
          .select("id")
          .in("id", attributes.who.workerIds);
        if (wErr) {
          warnings.push("Could not verify workers – table may not exist.");
        } else {
          const foundIds = (workers ?? []).map((w: { id: string }) => w.id);
          const missing = attributes.who.workerIds.filter((id: string) => !foundIds.includes(id));
          if (missing.length > 0) {
            errors.push(`Workers not found: ${missing.join(", ")}`);
          }
        }
      }

      // WHEN: validate start ≤ end
      if (attributes.when?.startDateTime && attributes.when?.endDateTime) {
        const start = new Date(attributes.when.startDateTime);
        const end   = new Date(attributes.when.endDateTime);
        if (end < start) {
          errors.push("End date/time must be after start date/time.");
        }
      }

      // WHERE: validate location + storage requirement mismatch
      if (attributes.where?.storageRoomId) {
        const { data: room, error: rErr } = await supabase
          .from("tc_storage_rooms")
          .select("id, room, tc_storage_requirements(code, name)")
          .eq("id", attributes.where.storageRoomId)
          .maybeSingle();

        if (rErr || !room) {
          errors.push(`Storage room not found: ${attributes.where.storageRoomId}`);
        } else {
          // Check material/product storage requirement mismatch
          if (attributes.where.itemType && attributes.where.itemId) {
            const table = attributes.where.itemType === "material" ? "tc_materials" : "tc_products";
            const { data: item } = await supabase
              .from(table)
              .select("storage_requirement_id, tc_storage_requirements(code, name)")
              .eq("id", attributes.where.itemId)
              .maybeSingle();

            if (item?.tc_storage_requirements?.code) {
              const itemReq  = item.tc_storage_requirements.code;
              const roomReq  = (room as any).tc_storage_requirements?.code;
              if (roomReq && itemReq !== roomReq) {
                warnings.push(
                  `Storage mismatch: item requires "${itemReq}" but selected room is "${roomReq}". Proceeding may compromise product quality.`
                );
              }
            }
          }
        }
      }
    }

    // ── Return result ─────────────────────────────────────────────────
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ valid: false, errors, warnings }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
      );
    }

    return new Response(
      JSON.stringify({ valid: true, errors: [], warnings }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ valid: false, errors: [err.message ?? "Internal error"] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

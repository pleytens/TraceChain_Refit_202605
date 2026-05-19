import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ValidationRequest {
  item_type: "material" | "product"; // what we're moving
  item_id: string; // tc_materials.id or tc_products.id
  target_room_id: string; // tc_storage_rooms.id we want to move to
}

interface ValidationResponse {
  valid: boolean;
  status: "match" | "mismatch" | "warning" | "error";
  message: string;
  details?: {
    item_storage_requirement?: string | null;
    room_storage_requirement?: string | null;
    item_requirement_code?: string | null;
    room_requirement_code?: string | null;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ValidationRequest = await req.json();
    const { item_type, item_id, target_room_id } = body;

    // Validate input
    if (!item_type || !item_id || !target_room_id) {
      return new Response(
        JSON.stringify({
          valid: false,
          status: "error",
          message: "Missing required fields: item_type, item_id, target_room_id",
        } as ValidationResponse),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    if (item_type !== "material" && item_type !== "product") {
      return new Response(
        JSON.stringify({
          valid: false,
          status: "error",
          message: 'item_type must be "material" or "product"',
        } as ValidationResponse),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Fetch the target room with its storage requirement
    const { data: room, error: roomError } = await supabase
      .from("tc_storage_rooms")
      .select(
        `
        id,
        room,
        building,
        floor,
        is_active,
        storage_requirement_id,
        tc_storage_requirements!storage_requirement_id (
          id,
          name,
          code
        )
      `
      )
      .eq("id", target_room_id)
      .single();

    if (roomError || !room) {
      return new Response(
        JSON.stringify({
          valid: false,
          status: "error",
          message: `Target room not found: ${target_room_id}`,
        } as ValidationResponse),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    if (!room.is_active) {
      return new Response(
        JSON.stringify({
          valid: false,
          status: "error",
          message: `Target room ${room.building}-${room.floor}-${room.room} is inactive`,
        } as ValidationResponse),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 422,
        }
      );
    }

    // Fetch the item's storage requirement
    const table = item_type === "material" ? "tc_materials" : "tc_products";

    const { data: item, error: itemError } = await supabase
      .from(table)
      .select("id, storage_requirement_id")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      return new Response(
        JSON.stringify({
          valid: false,
          status: "error",
          message: `${item_type} not found: ${item_id}`,
        } as ValidationResponse),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Retrieve storage requirement details for the item
    let itemRequirement: { id: string; name: string; code: string } | null =
      null;

    if (item.storage_requirement_id) {
      const { data: reqData } = await supabase
        .from("tc_storage_requirements")
        .select("id, name, code")
        .eq("id", item.storage_requirement_id)
        .single();

      itemRequirement = reqData ?? null;
    }

    const roomRequirement = (room as any).tc_storage_requirements ?? null;

    const details = {
      item_storage_requirement: itemRequirement?.name ?? null,
      room_storage_requirement: roomRequirement?.name ?? null,
      item_requirement_code: itemRequirement?.code ?? null,
      room_requirement_code: roomRequirement?.code ?? null,
    };

    // Case 1: Item has no storage requirement → allow with warning
    if (!item.storage_requirement_id) {
      return new Response(
        JSON.stringify({
          valid: true,
          status: "warning",
          message: `${item_type} has no storage requirement assigned. Movement allowed, but consider assigning one.`,
          details,
        } as ValidationResponse),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Case 2: Room has no storage requirement → allow with warning
    if (!room.storage_requirement_id) {
      return new Response(
        JSON.stringify({
          valid: true,
          status: "warning",
          message: `Target room has no storage requirement assigned. Movement allowed, but room should be configured.`,
          details,
        } as ValidationResponse),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Case 3: Both exist — check if they match
    if (item.storage_requirement_id === room.storage_requirement_id) {
      return new Response(
        JSON.stringify({
          valid: true,
          status: "match",
          message: `Storage requirements match: ${itemRequirement?.name ?? ""}. Movement approved.`,
          details,
        } as ValidationResponse),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Case 4: Mismatch
    return new Response(
      JSON.stringify({
        valid: false,
        status: "mismatch",
        message: `Storage requirement mismatch. Item requires "${itemRequirement?.name ?? "unknown"}" but room is configured for "${roomRequirement?.name ?? "unknown"}".`,
        details,
      } as ValidationResponse),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 422,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        valid: false,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      } as ValidationResponse),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

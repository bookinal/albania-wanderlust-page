import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  // ── 1. Find all active confirmed+paid bookings covering today ────────────
  // A booking is "active today" when: startDate <= today <= endDate
  // Only cars and apartments have a manageable status field.
  const { data: activeBookings, error: fetchError } = await supabase
    .from("booking")
    .select("propertyId, propertyType")
    .eq("status", "confirmed")
    .eq("payment_status", "paid")
    .lte("startDate", today)
    .gte("endDate", today)
    .in("propertyType", ["car", "apartment"]);

  if (fetchError) {
    console.error("Error fetching active bookings:", fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const active = activeBookings ?? [];

  // Collect active property IDs by type
  const activeCarIds = [
    ...new Set(
      active
        .filter((b) => b.propertyType === "car")
        .map((b) => Number(b.propertyId)),
    ),
  ];
  const activeApartmentIds = [
    ...new Set(
      active
        .filter((b) => b.propertyType === "apartment")
        .map((b) => Number(b.propertyId)),
    ),
  ];

  let rentedCars = 0;
  let rentedApartments = 0;
  let releasedCars = 0;
  let releasedApartments = 0;

  // ── 2. Mark active properties as "rented" ────────────────────────────────

  if (activeCarIds.length > 0) {
    const { count, error } = await supabase
      .from("car")
      .update({ status: "rented" })
      .in("id", activeCarIds)
      .neq("status", "rented") // skip already-rented (no-op writes)
      .select("id", { count: "exact", head: true });

    if (error) console.error("Error marking cars as rented:", error);
    else rentedCars = count ?? 0;
  }

  if (activeApartmentIds.length > 0) {
    const { count, error } = await supabase
      .from("apartment")
      .update({ status: "rented" })
      .in("id", activeApartmentIds)
      .neq("status", "rented")
      .select("id", { count: "exact", head: true });

    if (error) console.error("Error marking apartments as rented:", error);
    else rentedApartments = count ?? 0;
  }

  // ── 3. Release properties whose booking period ended ─────────────────────
  // Only touch properties that are currently "rented" — never touch
  // "maintenance" or "review" status (those are set manually by the provider).

  // Cars currently rented but NOT in the active-today list → free them
  const { data: currentlyRentedCars, error: carFetchError } = await supabase
    .from("car")
    .select("id")
    .eq("status", "rented");

  if (carFetchError) {
    console.error("Error fetching rented cars:", carFetchError);
  } else {
    const carsToRelease = (currentlyRentedCars ?? [])
      .map((c) => c.id)
      .filter((id) => !activeCarIds.includes(id));

    if (carsToRelease.length > 0) {
      const { count, error } = await supabase
        .from("car")
        .update({ status: "available" })
        .in("id", carsToRelease)
        .select("id", { count: "exact", head: true });

      if (error) console.error("Error releasing cars:", error);
      else releasedCars = count ?? 0;
    }
  }

  // Apartments currently rented but NOT in the active-today list → free them
  const { data: currentlyRentedApartments, error: aptFetchError } =
    await supabase.from("apartment").select("id").eq("status", "rented");

  if (aptFetchError) {
    console.error("Error fetching rented apartments:", aptFetchError);
  } else {
    const apartmentsToRelease = (currentlyRentedApartments ?? [])
      .map((a) => a.id)
      .filter((id) => !activeApartmentIds.includes(id));

    if (apartmentsToRelease.length > 0) {
      const { count, error } = await supabase
        .from("apartment")
        .update({ status: "available" })
        .in("id", apartmentsToRelease)
        .select("id", { count: "exact", head: true });

      if (error) console.error("Error releasing apartments:", error);
      else releasedApartments = count ?? 0;
    }
  }

  const result = {
    date: today,
    rented: { cars: rentedCars, apartments: rentedApartments },
    released: { cars: releasedCars, apartments: releasedApartments },
  };

  console.log("Property status update complete:", JSON.stringify(result));

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

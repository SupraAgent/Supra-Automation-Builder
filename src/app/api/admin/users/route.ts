import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { canManageRole, assignableRoles } from "@/lib/admin";
import type { UserRole } from "@/lib/admin";

/** GET /api/admin/users — list all users with roles */
export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check caller is admin or owner
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!callerProfile || !["owner", "admin"].includes(callerProfile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: profiles, callerRole: callerProfile.role });
}

/** PATCH /api/admin/users — update a user's role */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!callerProfile || !["owner", "admin"].includes(callerProfile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { targetUserId, newRole } = body as { targetUserId: string; newRole: UserRole };

  if (!targetUserId || !newRole) {
    return NextResponse.json({ error: "Missing targetUserId or newRole" }, { status: 400 });
  }

  // Cannot change your own role
  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  // Check the target's current role
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .single();

  if (!targetProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const callerRole = callerProfile.role as UserRole;
  const targetCurrentRole = targetProfile.role as UserRole;

  // Actor must outrank target
  if (!canManageRole(callerRole, targetCurrentRole)) {
    return NextResponse.json({ error: "Cannot modify a user with equal or higher role" }, { status: 403 });
  }

  // New role must be in the assignable set
  if (!assignableRoles(callerRole).includes(newRole)) {
    return NextResponse.json({ error: `Cannot assign role: ${newRole}` }, { status: 403 });
  }

  // Use admin client to bypass RLS for role update
  const adminClient = createSupabaseAdmin();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { error } = await adminClient
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, targetUserId, newRole });
}

/** DELETE /api/admin/users — remove a user */
export async function DELETE(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!callerProfile || !["owner", "admin"].includes(callerProfile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("id");

  if (!targetUserId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .single();

  if (!targetProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const callerRole = callerProfile.role as UserRole;
  const targetCurrentRole = targetProfile.role as UserRole;

  if (!canManageRole(callerRole, targetCurrentRole)) {
    return NextResponse.json({ error: "Cannot remove a user with equal or higher role" }, { status: 403 });
  }

  const adminClient = createSupabaseAdmin();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { error } = await adminClient
    .from("profiles")
    .delete()
    .eq("id", targetUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, removed: targetUserId });
}

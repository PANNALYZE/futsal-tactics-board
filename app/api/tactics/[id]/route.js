import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { CATEGORIES } from "../../../lib/steps";

const VALID_CATEGORIES = CATEGORIES.map((c) => c.key);

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("tactics")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Tactic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load tactic" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, steps, category, description } = await request.json();

    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "invalid category" }, { status: 400 });
    }

    const patch = { name, steps, updated_at: new Date().toISOString() };
    if (category !== undefined) patch.category = category;
    if (description !== undefined) patch.description = description;

    const { error } = await supabase
      .from("tactics")
      .update(patch)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ id, name });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update tactic" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { name } = await request.json();

    const { error } = await supabase
      .from("tactics")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ id, name });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to rename tactic" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("tactics")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete tactic" },
      { status: 500 }
    );
  }
}

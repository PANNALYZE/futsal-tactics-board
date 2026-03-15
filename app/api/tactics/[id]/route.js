import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

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
    const { name, steps } = await request.json();

    const { error } = await supabase
      .from("tactics")
      .update({ name, steps, updated_at: new Date().toISOString() })
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

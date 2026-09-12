import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import { CATEGORIES } from "../../lib/steps";

const MAX_TACTICS = 20;
const VALID_CATEGORIES = CATEGORIES.map((c) => c.key);

export async function POST(request) {
  try {
    const { name, steps, category = "other", description = "" } = await request.json();

    if (!name || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: "name and steps are required" },
        { status: 400 }
      );
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "invalid category" }, { status: 400 });
    }

    // Check limit
    const { count } = await supabase
      .from("tactics")
      .select("*", { count: "exact", head: true });

    if (count >= MAX_TACTICS) {
      return NextResponse.json(
        { error: "登録上限（20個）に達しています。不要な戦術を削除してください。" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tactics")
      .insert({ name, steps, category, description })
      .select("id, name")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id, name: data.name });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save tactic" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tactics")
      .select("id, name, category, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ tactics: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list tactics" },
      { status: 500 }
    );
  }
}

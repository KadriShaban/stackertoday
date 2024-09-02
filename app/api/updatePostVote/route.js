// app/api/updatePostVote/route.js
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  const { postId, votes } = await request.json();

  try {
    const { error } = await supabase
      .from("posts")
      .update({ votes })
      .eq("id", postId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Vote updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating post vote:", error);
    return new Response(JSON.stringify({ error: "Failed to update vote" }), {
      status: 500,
    });
  }
}

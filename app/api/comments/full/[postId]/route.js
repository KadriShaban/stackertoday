import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request, { params }) {
  const { postId } = params;

  try {
    // Fetch comments along with user profile and nested replies
    const { data: comments, error } = await supabase
      .from("comments")
      .select(
        `
        id, content, upvote, downvote, parent_id, created_at,
        user_profiles(username),
        replies:comments(id, content, upvote, downvote, parent_id, created_at, user_profiles(username))
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify({ comments }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export const dynamic = "force-static";

export async function GET() {
  return new Response(JSON.stringify({ valid: false, data: null }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

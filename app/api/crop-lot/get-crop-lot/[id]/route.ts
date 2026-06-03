export const dynamic = "force-static";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export async function GET() {
  return new Response(JSON.stringify({ data: [] }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req) {
  try {
    return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
      status: 200,
      headers: {
        'Set-Cookie': `auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return new Response(JSON.stringify({ error: 'Logout failed' }), { status: 500 });
  }
}

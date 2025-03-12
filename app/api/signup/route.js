import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, adminCode } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already in use' }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assign role based on admin code
    let role = 'USER';
    if (adminCode === process.env.ADMIN_SECRET) {
      role = 'ADMIN';
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Generate JWT Token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("Generated Token:", token); // Debugging log

    // Return response with token
    return new Response(JSON.stringify({ message: 'Signup successful', token, user: newUser }), {
      status: 201,
      headers: {
        'Set-Cookie': `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

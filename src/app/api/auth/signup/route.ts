import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Lütfen tüm alanları doldurun' },
        { status: 400 }
      )
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Geçersiz email formatı' },
        { status: 400 }
      )
    }

    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Email'in kullanımda olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      )
    }

    // Şifreyi hashle
    const hashedPassword = await hash(password, 12)

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.READER,
      },
    })

    return NextResponse.json(
      {
        message: 'Kullanıcı başarıyla oluşturuldu',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Kayıt hatası:', error)
    return NextResponse.json(
      { message: 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
} 
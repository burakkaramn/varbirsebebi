import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Kullanıcı giriş yapmamışsa veya admin değilse hata döndür
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const { email, role } = await req.json()

    if (!email || !role) {
      return NextResponse.json(
        { message: 'Email ve rol alanları zorunludur' },
        { status: 400 }
      )
    }

    // Rol değerinin geçerli olup olmadığını kontrol et
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json(
        { message: 'Geçersiz rol' },
        { status: 400 }
      )
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Kullanıcının rolünü güncelle
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: role as UserRole },
    })

    return NextResponse.json(
      {
        message: 'Kullanıcı rolü başarıyla güncellendi',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Rol güncelleme hatası:', error)
    return NextResponse.json(
      { message: 'Rol güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 
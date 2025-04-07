import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Kullanıcı giriş yapmamışsa veya yazar değilse hata döndür
    if (!session || session.user.role !== 'WRITER') {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const { title, content } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Başlık ve içerik alanları zorunludur' },
        { status: 400 }
      )
    }

    // Yazıyı oluştur
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(
      {
        message: 'Yazı başarıyla oluşturuldu',
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Yazı oluşturma hatası:', error)
    return NextResponse.json(
      { message: 'Yazı oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
} 
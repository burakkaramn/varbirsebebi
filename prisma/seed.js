const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@varbirsebebi.com' },
    update: {},
    create: {
      email: 'admin@varbirsebebi.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create writer user
  const writerPassword = await hash('writer123', 12)
  const writer = await prisma.user.upsert({
    where: { email: 'yazar@varbirsebebi.com' },
    update: {},
    create: {
      email: 'yazar@varbirsebebi.com',
      name: 'Örnek Yazar',
      password: writerPassword,
      role: 'WRITER',
      bio: 'Kendi halinde bir yazar',
    },
  })

  // Create sample post
  const post = await prisma.post.create({
    data: {
      title: 'Merhaba Dünya',
      content: 'Bu bizim ilk yazımız. Hoş geldiniz!',
      published: true,
      authorId: writer.id,
    },
  })

  console.log({ admin, writer, post })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
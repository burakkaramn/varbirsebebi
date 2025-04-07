import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getWriters() {
  const writers = await prisma.user.findMany({
    where: {
      role: 'WRITER',
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      posts: {
        _count: 'desc',
      },
    },
  })

  return writers
}

export default async function Writers() {
  const writers = await getWriters()

  return (
    <main className="page-content">
      <div className="container">
        <div className="card">
          <h1>Yazarlarımız</h1>

          <div className="writers-grid">
            {writers.map((writer) => (
              <div key={writer.id} className="writer-card">
                <div className="writer-info">
                  <img
                    src={`https://ui-avatars.com/api/?name=${writer.name ?? ''}`}
                    alt={writer.name ?? ''}
                    className="writer-avatar"
                  />
                  <div className="writer-details">
                    <h2>{writer.name}</h2>
                    <p className="post-count">
                      {writer._count.posts} yazı
                    </p>
                  </div>
                </div>
                <Link href={`/writers/${writer.id}`} className="read-more">
                  Yazılarını Gör →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
} 
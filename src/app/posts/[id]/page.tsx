import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  return post
}

export default async function Post({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-gray-500">
            {post.author.name} tarafından{' '}
            {new Date(post.createdAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  )
} 
import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

// HTML temizleme fonksiyonu
function stripHtml(html: string) {
  if (!html) return '';
  
  let text = html.replace(/<img[^>]*>/g, '');
  text = text.replace(/<\/?div[^>]*>/g, '\n');
  text = text.replace(/<\/?p[^>]*>/g, '\n');
  text = text.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
  text = text.replace(/<[^>]*>/g, '');
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n');
  text = text.trim();
  
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  
  return text;
}

async function getWriter(id: string) {
  try {
    const writer = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    
    if (!writer) {
      return null
    }

    return writer
  } catch (error) {
    console.error('Error fetching writer:', error)
    return null
  }
}

export default async function WriterPage({ params }: { params: { id: string } }) {
  const writer = await getWriter(params.id)

  if (!writer) {
    notFound()
  }

  return (
    <main className="page-content">
      <div className="container">
        <div className="writer-profile">
          <h1 className="page-title">{writer.name}</h1>
          <div className="writer-stats">
            <span>{writer.posts.length} Yazı</span>
          </div>
        </div>

        <div className="posts-grid">
          {writer.posts.length > 0 ? (
            writer.posts.map((post) => (
              <article key={post.id} className="post-card">
                <Link href={`/post/${post.id}`} className="post-title">
                  <h2>{post.title}</h2>
                </Link>
                <div className="post-meta">
                  <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <p className="post-excerpt">
                  {stripHtml(post.content).slice(0, 200)}...
                </p>
                <div className="post-footer">
                  <Link href={`/post/${post.id}`} className="read-more">
                    Devamını Oku
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <p>Bu yazarın henüz yazısı yok.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
} 
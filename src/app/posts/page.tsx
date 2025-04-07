import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

// HTML temizleme fonksiyonu
function stripHtml(html: string) {
  if (!html) return '';
  
  // Önce img etiketlerini kaldır
  let text = html.replace(/<img[^>]*>/g, '');
  
  // Div ve p etiketlerini yeni satırla değiştir
  text = text.replace(/<\/?div[^>]*>/g, '\n');
  text = text.replace(/<\/?p[^>]*>/g, '\n');
  
  // Link etiketlerini sadece içeriğiyle değiştir
  text = text.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
  
  // Diğer tüm HTML etiketlerini kaldır
  text = text.replace(/<[^>]*>/g, '');
  
  // Fazla boşlukları ve satır sonlarını temizle
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n');
  text = text.trim();
  
  // HTML entities'leri düzelt
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  
  return text;
}

async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    })
    return posts
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default async function Posts() {
  const posts = await getPosts()

  return (
    <main className="page-content">
      <div className="container">
        <h1 className="page-title">Tüm Yazılar</h1>
        <div className="posts-grid">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="post-card">
                <Link href={`/post/${post.id}`} className="post-title">
                  <h2>{post.title}</h2>
                </Link>
                <div className="post-meta">
                  <span>{post.author?.name}</span>
                  <span className="separator">•</span>
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
              <p>Henüz hiç yazı yok.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
} 
import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getLatestPosts() {
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
      take: 10,
    })
    return posts
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

async function getTopWriters() {
  try {
    const writers = await prisma.user.findMany({
      where: { role: 'WRITER' },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: 10,
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })
    return writers
  } catch (error) {
    console.error('Error fetching writers:', error)
    return []
  }
}

function truncateWords(text: string, wordCount: number) {
  const words = text.split(/\s+/).slice(0, wordCount)
  return words.join(' ') + (words.length >= wordCount ? '...' : '')
}

function stripHtml(html: string) {
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

export default async function Home() {
  const [posts, writers] = await Promise.all([
    getLatestPosts(),
    getTopWriters(),
  ])

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Tamam da Niye Buradayız?</h1>
            <p>Herhangi bir yazarlık, şairlik iddiamız yok. Kendi halinde, neşeli, şakacı delikanlılarız.</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="content">
        <div className="container">
          <div className="content-grid">
            {/* Posts Section */}
            <div className="posts-section">
              <h2>Son Yazılar</h2>
              <div className="post-list">
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <article key={post.id} className="post-card">
                      <Link href={`/post/${post.id}`} className="post-title">
                        <h3>{post.title}</h3>
                      </Link>
                      <div className="post-meta">
                        <span>{post.author?.name}</span>
                        <span className="separator">•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      {index === 0 ? (
                        <p className="post-excerpt">
                          {truncateWords(stripHtml(post.content), 30)}...
                        </p>
                      ) : null}
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

            {/* Sidebar */}
            <aside className="sidebar">
              <div className="writers-widget">
                <h2>Yazarlarımız</h2>
                <div className="writers-list">
                  {writers.length > 0 ? (
                    writers.map((writer) => (
                      <Link
                        key={writer.id}
                        href={`/profile/${writer.id}`}
                        className="writer-item"
                      >
                        <span className="writer-name">{writer.name}</span>
                        <span className="post-count">
                          {writer._count.posts} yazı
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="empty-state">Henüz hiç yazar yok.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
} 
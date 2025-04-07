'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header>
      <div className="container">
        <nav>
          <Link href="/" className="logo">
            VarBirSebebi
          </Link>
          <div className="nav-links">
            <Link href="/posts">Yazılar</Link>
            <Link href="/writers">Yazarlar</Link>
            {session ? (
              <div className="user-menu">
                <button
                  type="button"
                  className="avatar-button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <img
                    className="avatar"
                    src={`https://ui-avatars.com/api/?name=${session.user?.name}`}
                    alt={session.user?.name || ''}
                  />
                </button>

                {isMenuOpen && (
                  <div className="dropdown-menu">
                    {session.user?.role === 'WRITER' && (
                      <Link href="/posts/new">
                        Yeni Yazı
                      </Link>
                    )}
                    {session.user?.role === 'ADMIN' && (
                      <Link href="/admin">
                        Admin Paneli
                      </Link>
                    )}
                    <button onClick={() => signOut()}>
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link href="/auth/signin" className="btn btn-secondary">
                  Giriş Yap
                </Link>
                <Link href="/auth/signup" className="btn">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
} 
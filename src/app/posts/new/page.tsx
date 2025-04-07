'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function NewPost() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Eğer kullanıcı giriş yapmamışsa veya yazar değilse ana sayfaya yönlendir
  if (!session || session.user?.role !== 'WRITER') {
    router.push('/')
    return null
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const content = formData.get('content') as string

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Bir hata oluştu')
      }

      router.push(`/posts/${data.post.id}`)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Yazı oluşturulurken bir hata oluştu')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Yeni Yazı</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Başlık
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              required
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Yazınızın başlığı"
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            İçerik
          </label>
          <div className="mt-1">
            <textarea
              id="content"
              name="content"
              rows={15}
              required
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Yazınızın içeriği..."
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Yazı oluşturuluyor...' : 'Yazıyı Yayınla'}
          </button>
        </div>
      </form>
    </div>
  )
} 
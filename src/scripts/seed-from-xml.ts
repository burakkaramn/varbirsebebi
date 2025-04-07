import { parseStringPromise } from 'xml2js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // XML dosyasını oku
    const xmlData = readFileSync(join(process.cwd(), 'src', 'blog-04-01-2025.xml'), 'utf-8')
    
    // XML'i parse et
    const result = await parseStringPromise(xmlData)
    
    // Debug için XML yapısını kontrol et
    console.log('XML yapısı:', JSON.stringify(result, null, 2))
    
    // Yazarları ve yazıları çıkar
    const entries = result.feed.entry || []
    console.log(`Toplam entry sayısı: ${entries.length}`)
    const authors = new Map()

    // Önce yazarları ekle
    for (const entry of entries) {
      if (entry.author && entry.author[0].name) {
        const authorName = entry.author[0].name[0]
        if (!authors.has(authorName)) {
          // Yazar için rastgele bir email oluştur
          const email = `${authorName.toLowerCase().replace(/\s+/g, '.')}@example.com`
          
          try {
            // Yazarı database'e ekle
            const author = await prisma.user.upsert({
              where: { email },
              update: {},
              create: {
                name: authorName,
                email,
                password: await hash('password123', 12),
                role: UserRole.WRITER,
              },
            })
            
            authors.set(authorName, author)
            console.log(`Yazar eklendi: ${authorName}`)
          } catch (error) {
            console.error(`Yazar eklenirken hata: ${authorName}`, error)
          }
        }
      }
    }

    // Sonra yazıları ekle
    for (const entry of entries) {
      // Template ve layout girişlerini atla
      if (entry.category && entry.category[0].$ && entry.category[0].$.term.includes('template')) {
        continue
      }

      if (entry.author && entry.author[0].name && entry.title && entry.content) {
        const authorName = entry.author[0].name[0]
        const author = authors.get(authorName)

        if (author) {
          const title = entry.title[0]._ || entry.title[0]
          const content = entry.content[0]._ || entry.content[0]
          const publishedDate = new Date(entry.published[0])

          // Debug için yazı bilgilerini kontrol et
          console.log('Yazı bilgileri:', {
            authorName,
            title,
            contentLength: content ? content.length : 0,
            publishedDate
          })

          try {
            // Yazıyı database'e ekle
            await prisma.post.create({
              data: {
                title: title || 'Başlıksız',
                content: content || '',
                authorId: author.id,
                createdAt: publishedDate,
                updatedAt: publishedDate,
              },
            })

            console.log(`Yazı eklendi: ${title || 'Başlıksız'}`)
          } catch (error) {
            console.error(`Yazı eklenirken hata: ${title}`, error)
          }
        }
      }
    }

    console.log('Veriler başarıyla yüklendi!')
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 
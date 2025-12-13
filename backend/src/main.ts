import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import * as express from 'express'
import { join } from 'path'
import * as fs from 'fs'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })

  // ✅ Надёжный путь: рядом с проектом бэка (а не где случайно оказался process.cwd())
  const uploadsDir = join(__dirname, '..', 'uploads')
  const productsDir = join(uploadsDir, 'products')

  if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true })

  // Раздаём /uploads/... из реальной папки uploads
  app.use('/uploads', express.static(uploadsDir))

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  )

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`Souvenir Shop backend is running on http://localhost:${port}`)
  console.log(`Static uploads dir: ${uploadsDir}`) // ✅ полезно для проверки
}

bootstrap()

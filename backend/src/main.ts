import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false
    })
  )

  const port = process.env.PORT || 4000
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`Souvenir Shop backend is running on http://localhost:${port}`)
}

bootstrap()

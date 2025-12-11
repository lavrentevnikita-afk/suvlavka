import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CatalogModule } from './catalog/catalog.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres' as const,
        host: process.env.POSTGRES_HOST || 'db',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        username: process.env.POSTGRES_USER || 'souvenir',
        password: process.env.POSTGRES_PASSWORD || 'souvenir',
        database: process.env.POSTGRES_DB || 'souvenir',
        autoLoadEntities: true,
        synchronize: true
      })
    }),
    CatalogModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

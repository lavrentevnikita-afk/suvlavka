import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { Category } from './category.entity'
import { Product } from './product.entity'
import { ProductImage } from './product-image.entity'
import { GetProductsQueryDto, SearchQueryDto } from './dto'
import { Stock } from '../b2b/stock.entity'

@Injectable()
export class CatalogService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imagesRepo: Repository<ProductImage>,
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>
  ) {}

  async onModuleInit() {
    // Simple seeding for development: create a couple of categories and products if DB is empty
    const count = await this.categoriesRepo.count()
    if (count > 0) return

    const souvenirs = this.categoriesRepo.create({
      slug: 'souvenirs',
      name: 'Сувениры',
      description: 'Классические сувениры для туристов и корпоративных подарков.'
    })
    const gifts = this.categoriesRepo.create({
      slug: 'gifts',
      name: 'Подарки',
      description: 'Подарки для друзей, коллег и партнёров.'
    })

    await this.categoriesRepo.save([souvenirs, gifts])

    const products: Product[] = []

    products.push(
      this.productsRepo.create({
        slug: 'magnet-moscow',
        name: 'Магнит «Москва»',
        article: 'SV-0001',
        description: 'Керамический магнит с видом Москвы.',
        specs: {
          Материал: 'Керамика',
          Размер: '7×5 см',
          Упаковка: 'Пакетик'
        },
        price: '350.00',
        isAvailable: true,
        popularity: 10,
        category: souvenirs
      }),
      this.productsRepo.create({
        slug: 'cup-logo',
        name: 'Кружка с логотипом',
        article: 'SV-0002',
        description: 'Белая керамическая кружка с возможностью нанесения логотипа.',
        specs: {
          Материал: 'Керамика',
          Объём: '330 мл',
          Упаковка: 'Картонная коробка'
        },
        price: '590.00',
        isAvailable: true,
        popularity: 25,
        category: gifts
      }),
      this.productsRepo.create({
        slug: 'tshirt-brand',
        name: 'Футболка фирменная',
        article: 'SV-0003',
        description: 'Хлопковая футболка с принтом.',
        specs: {
          Материал: '100% хлопок',
          Размеры: 'S–XL',
          Цвет: 'Белый'
        },
        price: '1290.00',
        isAvailable: false,
        popularity: 5,
        category: gifts
      })
    )

    const savedProducts = await this.productsRepo.save(products)

    const images: ProductImage[] = []

    for (const [index, product] of savedProducts.entries()) {
      images.push(
        this.imagesRepo.create({
          product,
          url: `https://placehold.co/600x400?text=Product+${index + 1}`,
          sortOrder: 0
        })
      )
    }

    await this.imagesRepo.save(images)
  }

  async getCategories() {
    const categories = await this.categoriesRepo.find({
      order: { name: 'ASC' }
    })
    return { categories }
  }

  async getProducts(query: GetProductsQueryDto) {
    const qb = this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')

    // Приоритет выбранного города: сначала товары, у которых есть остаток на складе этого города.
    // Реализация через stocks.warehouse (код/название города) — не ломает базовый каталог.
    if (query.city) {
      qb.leftJoin(
        'stocks',
        'cityStock',
        'cityStock.productId = product.id AND cityStock.warehouse = :city',
        { city: query.city },
      )
      qb.addSelect('COALESCE(cityStock.qty, 0)', 'cityQty')
      qb.orderBy(
        'CASE WHEN COALESCE(cityStock.qty, 0) > 0 THEN 0 ELSE 1 END',
        'ASC',
      )
      qb.addOrderBy('COALESCE(cityStock.qty, 0)', 'DESC')
    }

    if (query.category) {
      qb.andWhere('category.slug = :slug', { slug: query.category })
    }

    if (typeof query.minPrice === 'number') {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice })
    }

    if (typeof query.maxPrice === 'number') {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice })
    }

    if (query.inStock === 'true') {
      qb.andWhere('product.isAvailable = true')
    }

    // Sorting (добавляем как вторичный порядок, если город уже задал первичный)
    switch (query.sort) {
      case 'price':
        qb.addOrderBy('product.price', 'ASC')
        break
      case 'new':
        qb.addOrderBy('product.createdAt', 'DESC')
        break
      case 'popularity':
      default:
        qb.addOrderBy('product.popularity', 'DESC')
        break
    }

    const limit = query.limit ?? 24
    const page = query.page ?? 1
    qb.take(limit).skip((page - 1) * limit)

    const [items, total] = await qb.getManyAndCount()

    // Derived pricing fields (non-breaking): keep `price` as retail price and
    // add `retailPrice` + `wholesalePrice` for UI that shows both.
    // Can be overridden by WHOLESALE_COEF env.
    const wholesaleCoef = Number(process.env.WHOLESALE_COEF ?? '0.85')

    for (const p of items as any[]) {
      const retail = Number(p.price)
      p.retailPrice = p.price
      if (Number.isFinite(retail)) {
        p.wholesalePrice = (retail * wholesaleCoef).toFixed(2)
      } else {
        p.wholesalePrice = p.price
      }
    }

    return {
      total,
      page,
      limit,
      products: items
    }
  }

  async getProduct(id: number) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['category', 'images']
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const wholesaleCoef = Number(process.env.WHOLESALE_COEF ?? '0.85')
    const retail = Number((product as any).price)
    ;(product as any).retailPrice = (product as any).price
    if (Number.isFinite(retail)) {
      ;(product as any).wholesalePrice = (retail * wholesaleCoef).toFixed(2)
    } else {
      ;(product as any).wholesalePrice = (product as any).price
    }

    return { product }
  }

  async search(query: SearchQueryDto) {
    const limit = query.limit ?? 20
    const q = query.query.trim()

    if (!q) {
      return { products: [] }
    }

    const qb = this.productsRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.name ILIKE :q OR product.article ILIKE :q', { q: `%${q}%` })
      .take(limit)

    if (query.city) {
      qb.leftJoin(
        'stocks',
        'cityStock',
        'cityStock.productId = product.id AND cityStock.warehouse = :city',
        { city: query.city },
      )
      qb.addSelect('COALESCE(cityStock.qty, 0)', 'cityQty')
      qb.orderBy(
        'CASE WHEN COALESCE(cityStock.qty, 0) > 0 THEN 0 ELSE 1 END',
        'ASC',
      )
      qb.addOrderBy('COALESCE(cityStock.qty, 0)', 'DESC')
    }

    qb.addOrderBy('product.popularity', 'DESC')

    const products = await qb.getMany()

    const wholesaleCoef = Number(process.env.WHOLESALE_COEF ?? '0.85')
    for (const p of products as any[]) {
      const retail = Number(p.price)
      p.retailPrice = p.price
      if (Number.isFinite(retail)) {
        p.wholesalePrice = (retail * wholesaleCoef).toFixed(2)
      } else {
        p.wholesalePrice = p.price
      }
    }

    return { products }
  }
}

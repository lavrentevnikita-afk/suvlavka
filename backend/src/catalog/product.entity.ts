import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Category } from './category.entity'
import { ProductImage } from './product-image.entity'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  slug!: string

  @Column()
  name!: string

  @Column({ unique: true })
  article!: string

  @Column({ type: 'text', nullable: true })
  description: string | null = null

  @Column({ type: 'jsonb', nullable: true })
  specs: Record<string, string> | null = null

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price!: string

  @Column({ name: 'is_available', default: true })
  isAvailable!: boolean

  @Column({ type: 'int', default: 0 })
  popularity!: number

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  category!: Category

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true, eager: true })
  images!: ProductImage[]
}

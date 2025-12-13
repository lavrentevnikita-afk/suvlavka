import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Product } from '../catalog/product.entity'

@Entity('stocks')
@Index(['warehouse', 'product'], { unique: true })
export class Stock {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  product!: Product

  @Column({ type: 'varchar', length: 32 })
  warehouse!: string // например: "MSK", "SPB"

  @Column({ type: 'int', default: 0 })
  qty!: number
}

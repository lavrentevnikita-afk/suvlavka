import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export type StockMovementType = 'in' | 'out' | 'reserve' | 'unreserve' | 'adjust'

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Column({ type: 'varchar', length: 32 })
  warehouse!: string

  @Index()
  @Column({ type: 'int' })
  productId!: number

  @Column({ type: 'varchar', length: 16 })
  type!: StockMovementType

  @Column({ type: 'int' })
  qty!: number

  @Index()
  @Column({ type: 'int', nullable: true })
  orderId!: number | null

  @Column({ type: 'text', nullable: true })
  note!: string | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}

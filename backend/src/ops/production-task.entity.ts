import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export type ProductionStatus = 'planned' | 'in_work' | 'ready'

@Entity('production_tasks')
export class ProductionTask {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Column({ type: 'int' })
  orderId!: number

  @Index()
  @Column({ type: 'int' })
  productId!: number

  @Column({ type: 'int' })
  qty!: number

  @Column({ type: 'varchar', length: 16, default: 'planned' })
  status!: ProductionStatus

  // когда перевели готовое на склад
  @Column({ type: 'timestamptz', nullable: true })
  movedToStockAt!: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}

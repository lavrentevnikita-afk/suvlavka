import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

interface OrderItemRecord {
  productId: number
  quantity: number
  price: number
  name: string
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  customerName!: string

  @Column()
  phone!: string

  @Column({
    type: 'varchar',   // <--- ВАЖНО: ЯВНО УКАЗАН ТИП
    length: 255,
    nullable: true,
  })
  email!: string | null

  @Column()
  address!: string

  @Column({ type: 'text', nullable: true })
  comment!: string | null

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  totalPrice!: string

  @Column({ default: 'new' })
  status!: string

  @Column({ type: 'jsonb' })
  items!: OrderItemRecord[]

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date
}

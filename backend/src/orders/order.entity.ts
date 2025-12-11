import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export interface OrderItemRecord {
  productId: number
  quantity: number
  price: string
  name: string
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  customerName!: string

  @Column({ length: 255 })
  email!: string

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

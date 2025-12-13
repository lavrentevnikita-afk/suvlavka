import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export type ShipmentStatus = 'created' | 'shipped'

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Column({ type: 'int' })
  orderId!: number

  @Column({ type: 'varchar', length: 16, default: 'created' })
  status!: ShipmentStatus

  @Column({ type: 'timestamptz', nullable: true })
  shippedAt!: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}

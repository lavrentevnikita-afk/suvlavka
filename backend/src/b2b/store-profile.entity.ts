import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../users/user.entity'

export type StoreStatus = 'pending' | 'active' | 'rejected'

@Entity('store_profiles')
export class StoreProfile {
  @PrimaryGeneratedColumn()
  id!: number

  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: StoreStatus

  // реквизиты / общая инфа (минимально)
  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName!: string

  @Column({ type: 'varchar', length: 32, nullable: true })
  inn: string | null = null

  @Column({ type: 'varchar', length: 32, nullable: true })
  kpp: string | null = null

  @Column({ type: 'varchar', length: 32, nullable: true })
  ogrn: string | null = null

  @Column({ type: 'jsonb', nullable: true })
  contacts: Record<string, any> | null = null

  @Column({ name: 'price_group_id', type: 'int', nullable: true })
  priceGroupId: number | null = null

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date
}

import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  code!: string // "MSK", "SPB" и т.п.

  @Column({ type: 'varchar', length: 120, default: '' })
  name!: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}

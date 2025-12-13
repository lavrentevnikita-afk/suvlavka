import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

export type UserRole = 'customer' | 'store' | 'manager'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 120 })
  name!: string

  @Index({ unique: true })
  @Column({ length: 180 })
  email!: string

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string

  // ✅ новое поле (не ломает старых пользователей — будет customer)
  @Column({ type: 'varchar', length: 20, default: 'customer' })
  role!: UserRole

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}

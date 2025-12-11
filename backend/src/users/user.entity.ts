import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}

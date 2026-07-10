import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';

export type AuthProvider = 'google';

@Entity('auth_identities')
@Index(['provider', 'providerAccountId'], { unique: true })
export class AuthIdentity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'varchar', length: 32 })
  provider!: AuthProvider;

  @Column({ type: 'varchar', length: 255 })
  providerAccountId!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;
}

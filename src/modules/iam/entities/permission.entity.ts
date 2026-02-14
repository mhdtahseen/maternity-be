import { Column, Entity, ManyToMany } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission extends AppBaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}

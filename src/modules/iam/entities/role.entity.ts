import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role extends AppBaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
  @JoinTable({ name: 'role_permissions' })
  permissions: Permission[];
}

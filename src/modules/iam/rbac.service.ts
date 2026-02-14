import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileMember } from '@/modules/pregnancy-profiles/entities/profile-member.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(ProfileMember)
    private readonly profileMemberRepository: Repository<ProfileMember>
  ) {}

  async hasPermissions(userId: string, profileId: string, required: string[]): Promise<boolean> {
    const membership = await this.profileMemberRepository.findOne({
      where: { user: { id: userId }, profile: { id: profileId } },
      relations: ['role', 'role.permissions']
    });

    if (!membership) {
      return false;
    }

    const owned = new Set((membership.role.permissions ?? []).map((item) => item.code));
    return required.every((perm) => owned.has(perm));
  }
}

import { Repository } from 'typeorm';
import { ProfileMember } from '@/modules/pregnancy-profiles/entities/profile-member.entity';
export declare class RbacService {
    private readonly profileMemberRepository;
    constructor(profileMemberRepository: Repository<ProfileMember>);
    hasPermissions(userId: string, profileId: string, required: string[]): Promise<boolean>;
}

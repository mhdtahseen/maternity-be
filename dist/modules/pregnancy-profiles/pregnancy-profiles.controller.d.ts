import { PregnancyProfilesService } from './pregnancy-profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { AddMemberDto, UpdateMemberDto } from './dto/manage-member.dto';
export declare class PregnancyProfilesController {
    private readonly profilesService;
    constructor(profilesService: PregnancyProfilesService);
    create(user: {
        userId: string;
    }, dto: CreateProfileDto): Promise<import("./entities/pregnancy-profile.entity").PregnancyProfile>;
    getById(profileId: string): Promise<import("./entities/pregnancy-profile.entity").PregnancyProfile>;
    addMember(profileId: string, dto: AddMemberDto): Promise<import("./entities/profile-member.entity").ProfileMember>;
    updateMember(profileId: string, memberId: string, dto: UpdateMemberDto): Promise<import("./entities/profile-member.entity").ProfileMember>;
    removeMember(profileId: string, memberId: string): Promise<void>;
}

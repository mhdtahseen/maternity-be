export declare class AddMemberDto {
    email: string;
    roleCode: string;
    canUploadMedicalDocs?: boolean;
    canWriteJournal?: boolean;
}
export declare class UpdateMemberDto {
    roleCode?: string;
    canUploadMedicalDocs?: boolean;
    canWriteJournal?: boolean;
}

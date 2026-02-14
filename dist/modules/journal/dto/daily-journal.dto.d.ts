export declare class CreateDailyJournalDto {
    profileId: string;
    entryDate: string;
    mood?: string;
    symptoms?: string[];
    sleepHours?: number;
    appetite?: string;
    weightKg?: number;
    bloodPressure?: string;
    babyKicksCount?: number;
    doctorVisit?: boolean;
    notes?: string;
}
export declare class UpdateDailyJournalDto {
    mood?: string;
    symptoms?: string[];
    sleepHours?: number;
    appetite?: string;
    weightKg?: number;
    bloodPressure?: string;
    babyKicksCount?: number;
    doctorVisit?: boolean;
    notes?: string;
}
export declare class QueryDailyJournalDto {
    profileId: string;
    date?: string;
    from?: string;
    to?: string;
}

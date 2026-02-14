import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    live(): {
        status: string;
        timestamp: string;
    };
    ready(): Promise<{
        status: string;
        database: string;
        timestamp: string;
    }>;
}

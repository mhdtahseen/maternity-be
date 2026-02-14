declare class EnvironmentVariables {
    NODE_ENV: string;
    PORT: number;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_SSL?: string;
    DB_SYNCHRONIZE?: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};

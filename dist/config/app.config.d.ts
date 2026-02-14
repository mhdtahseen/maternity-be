declare const _default: (() => {
    name: string;
    env: string;
    port: number;
    throttleTtl: number;
    throttleLimit: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    name: string;
    env: string;
    port: number;
    throttleTtl: number;
    throttleLimit: number;
}>;
export default _default;

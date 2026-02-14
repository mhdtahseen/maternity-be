"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    name: process.env.APP_NAME ?? 'ai-multi-user-maternity-journal',
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    throttleTtl: Number(process.env.THROTTLE_TTL ?? 60),
    throttleLimit: Number(process.env.THROTTLE_LIMIT ?? 120)
}));
//# sourceMappingURL=app.config.js.map
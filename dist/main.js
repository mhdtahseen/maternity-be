"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const request_context_interceptor_1 = require("./common/interceptors/request-context.interceptor");
const app_logger_service_1 = require("./common/logger/app-logger.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    const logger = app.get(app_logger_service_1.AppLoggerService);
    app.useLogger(logger);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new request_context_interceptor_1.RequestContextInterceptor());
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    app.enableCors({
        origin: true,
        credentials: true
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('AI Multi-User Maternity Journal API')
        .setDescription('Production-grade backend APIs for maternity medical + emotional journaling platform')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
    logger.log(`API server running on port ${port}`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const files_service_1 = require("./files.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_1 = require("../../common/constants/permissions");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const upload_file_dto_1 = require("./dto/upload-file.dto");
let FilesController = class FilesController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    createUploadIntent(user, dto) {
        return this.filesService.createUploadIntent(user.userId, dto);
    }
    completeUpload(fileId, user, dto) {
        return this.filesService.completeUpload(fileId, user.userId, dto);
    }
    getDownloadUrl(fileId, user) {
        return this.filesService.getDownloadUrl(fileId, user.userId);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload-intent'),
    (0, permissions_decorator_1.RequirePermissions)(permissions_1.PERMISSIONS.DOCUMENT_UPLOAD),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_file_dto_1.CreateUploadIntentDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "createUploadIntent", null);
__decorate([
    (0, common_1.Post)(':fileId/complete'),
    (0, permissions_decorator_1.RequirePermissions)(permissions_1.PERMISSIONS.DOCUMENT_UPLOAD),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, upload_file_dto_1.CompleteUploadDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "completeUpload", null);
__decorate([
    (0, common_1.Get)(':fileId/download-url'),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getDownloadUrl", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map
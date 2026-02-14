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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const argon2 = require("argon2");
const crypto_1 = require("crypto");
const user_entity_1 = require("../users/entities/user.entity");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
let AuthService = class AuthService {
    constructor(userRepository, refreshTokenRepository, jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const passwordHash = await argon2.hash(dto.password);
        const user = this.userRepository.create({
            email: dto.email.toLowerCase(),
            fullName: dto.fullName,
            passwordHash
        });
        const saved = await this.userRepository.save(user);
        return { userId: saved.id };
    }
    async login(dto) {
        const user = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase(), isActive: true } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isValid = await argon2.verify(user.passwordHash, dto.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.issueTokens(user.id, user.email);
    }
    async refresh(refreshToken) {
        const [tokenId, rawToken] = refreshToken.split('.');
        if (!tokenId || !rawToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token format');
        }
        const found = await this.refreshTokenRepository.findOne({ where: { tokenId, revoked: false }, relations: ['user'] });
        if (!found || found.expiresAt <= new Date()) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const matches = await argon2.verify(found.tokenHash, rawToken);
        if (!matches) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        found.revoked = true;
        await this.refreshTokenRepository.save(found);
        return this.issueTokens(found.user.id, found.user.email);
    }
    async revoke(refreshToken) {
        const [tokenId] = refreshToken.split('.');
        if (!tokenId) {
            return;
        }
        await this.refreshTokenRepository.update({ tokenId }, { revoked: true });
    }
    async issueTokens(userId, email) {
        const accessToken = await this.jwtService.signAsync({ sub: userId, email }, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: Number(process.env.JWT_ACCESS_TTL ?? 900)
        });
        const tokenId = (0, crypto_1.randomUUID)();
        const tokenSecret = (0, crypto_1.randomUUID)().replace(/-/g, '') + (0, crypto_1.randomUUID)().replace(/-/g, '');
        const tokenHash = await argon2.hash(tokenSecret);
        const refreshToken = this.refreshTokenRepository.create({
            tokenId,
            tokenHash,
            expiresAt: new Date(Date.now() + Number(process.env.JWT_REFRESH_TTL ?? 1209600) * 1000),
            user: { id: userId }
        });
        await this.refreshTokenRepository.save(refreshToken);
        return {
            accessToken,
            refreshToken: `${tokenId}.${tokenSecret}`
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
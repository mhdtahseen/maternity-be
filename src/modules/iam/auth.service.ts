import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { User } from '@/modules/users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<{ userId: string }> {
    const passwordHash = await argon2.hash(dto.password);
    const user = this.userRepository.create({
      email: dto.email.toLowerCase(),
      fullName: dto.fullName,
      passwordHash
    });
    const saved = await this.userRepository.save(user);
    return { userId: saved.id };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase(), isActive: true } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const [tokenId, rawToken] = refreshToken.split('.');
    if (!tokenId || !rawToken) {
      throw new UnauthorizedException('Invalid refresh token format');
    }

    const found = await this.refreshTokenRepository.findOne({ where: { tokenId, revoked: false }, relations: ['user'] });
    if (!found || found.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await argon2.verify(found.tokenHash, rawToken);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    found.revoked = true;
    await this.refreshTokenRepository.save(found);

    return this.issueTokens(found.user.id, found.user.email);
  }

  async revoke(refreshToken: string): Promise<void> {
    const [tokenId] = refreshToken.split('.');
    if (!tokenId) {
      return;
    }

    await this.refreshTokenRepository.update({ tokenId }, { revoked: true });
  }

  private async issueTokens(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: Number(process.env.JWT_ACCESS_TTL ?? 900)
      }
    );

    const tokenId = randomUUID();
    const tokenSecret = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
    const tokenHash = await argon2.hash(tokenSecret);

    const refreshToken = this.refreshTokenRepository.create({
      tokenId,
      tokenHash,
      expiresAt: new Date(Date.now() + Number(process.env.JWT_REFRESH_TTL ?? 1209600) * 1000),
      user: { id: userId } as User
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: `${tokenId}.${tokenSecret}`
    };
  }
}

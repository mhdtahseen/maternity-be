import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly refreshTokenRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        userId: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    revoke(refreshToken: string): Promise<void>;
    private issueTokens;
}

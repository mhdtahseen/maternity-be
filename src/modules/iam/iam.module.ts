import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { User } from '@/modules/users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RbacService } from './rbac.service';
import { ProfileMember } from '@/modules/pregnancy-profiles/entities/profile-member.entity';
import { RbacBootstrapService } from './rbac-bootstrap.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, Role, Permission, ProfileMember]),
    JwtModule.register({})
  ],
  providers: [AuthService, JwtStrategy, RbacService, RbacBootstrapService],
  controllers: [AuthController],
  exports: [RbacService]
})
export class IamModule {}

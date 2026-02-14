import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findById(userId: string): Promise<User>;
    update(userId: string, dto: UpdateUserDto): Promise<User>;
}

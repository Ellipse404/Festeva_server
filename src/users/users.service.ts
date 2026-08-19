import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, AuthProvider } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: email.trim() });

    if (includePassword) {
      query.addSelect('user.password');
    }

    return query.getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create({
      ...userData,
      email: userData.email.trim().toLowerCase(),
    });
    return this.usersRepository.save(newUser);
  }

  async findOrCreateSocialUser(data: {
    email: string;
    name: string;
    avatar?: string;
    provider: AuthProvider;
    providerId?: string;
  }): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      // Update provider if registering via social login
      existing.provider = data.provider;
      if (data.providerId) existing.providerId = data.providerId;
      if (data.avatar && !existing.avatar) existing.avatar = data.avatar;
      return this.usersRepository.save(existing);
    }

    const newUser = this.usersRepository.create({
      email: data.email.trim().toLowerCase(),
      name: data.name,
      avatar:
        data.avatar ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      provider: data.provider,
      providerId: data.providerId,
    });

    return this.usersRepository.save(newUser);
  }
}

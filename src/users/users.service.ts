import { Injectable, NotFoundException } from '@nestjs/common';
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
    const isGoogle = userData.provider === 'google';
    const newUser = this.usersRepository.create({
      ...userData,
      email: userData.email?.trim().toLowerCase(),
      isEmailVerified: isGoogle ? true : Boolean(userData.isEmailVerified),
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
    const isGoogle = data.provider === 'google';

    if (existing) {
      existing.provider = data.provider;
      if (data.providerId) existing.providerId = data.providerId;
      if (data.avatar && !existing.avatar) existing.avatar = data.avatar;
      if (isGoogle) {
        existing.isEmailVerified = true;
        if (existing.isPhoneVerified) {
          existing.isVerified = true;
        }
      }
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
      isEmailVerified: isGoogle,
    });

    return this.usersRepository.save(newUser);
  }

  async markPhoneAsVerified(
    userId: string | undefined,
    userEmail: string | undefined,
    phoneNumber: string,
  ): Promise<User | null> {
    let user = userId ? await this.findById(userId) : null;
    if (!user && userEmail) {
      user = await this.findByEmail(userEmail);
    }
    if (user) {
      user.isPhoneVerified = true;
      user.phoneNumber = phoneNumber;
      if (user.isEmailVerified || user.provider === 'google') {
        user.isVerified = true;
      }
      return this.usersRepository.save(user);
    }
    return null;
  }

  async markEmailAsVerified(
    userId: string | undefined,
    userEmail: string | undefined,
    email: string,
  ): Promise<User | null> {
    let user = userId ? await this.findById(userId) : null;
    if (!user && (userEmail || email)) {
      user = await this.findByEmail(userEmail || email);
    }
    if (user) {
      user.isEmailVerified = true;
      if (user.isPhoneVerified) {
        user.isVerified = true;
      }
      return this.usersRepository.save(user);
    }
    return null;
  }

  async markUserAsVerified(
    userId: string,
    aadhaarNumber: string,
    verificationDetails?: Record<string, any>,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isVerified = true;
    user.isPhoneVerified = true;
    user.isEmailVerified = true;
    user.aadhaarNumber = aadhaarNumber;
    user.verificationDetails = verificationDetails || {};

    return this.usersRepository.save(user);
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/User.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public async findOneById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    const existingUser = await this.findOneByEmail(email);

    if (existingUser)
      throw new ConflictException('User with this email already exists');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    await this.usersRepository.save(newUser);

    return newUser;
  }

  public async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOneById(id);

    if (!user) throw new ConflictException('User not found');

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    if (updateUserDto.email && updateUserDto.email !== user.login) {
      const existingUser = await this.findOneByEmail(updateUserDto.email);

      if (existingUser)
        throw new ConflictException('User with this email already exists');
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  public async deleteUser(id: number) {
    const user = await this.findOneById(id);

    if (!user) throw new ConflictException('User not found');

    await this.usersRepository.remove(user);
  }

  private async findOneByEmail(email: string) {
    return this.usersRepository.findOne({ where: { login: email } });
  }
}

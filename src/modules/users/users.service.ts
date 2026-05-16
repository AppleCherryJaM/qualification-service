/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/User.entity';
import { Employee } from '../employees/entities/Employee.entity';
import { UserRole } from './entities/UserRole.entity';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { RegisterEmployeeDto } from '../employees/dtos/register-employee.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    private dataSource: DataSource,
  ) {}

  public async findAll() {
    return this.usersRepository.find({
      relations: ['roles', 'roles.role', 'employee'],
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.role', 'employee'],
    });
  }

  public async findOneById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.role', 'employee'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, employeeId } = createUserDto;

    // Check email uniqueness
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check employeeId constraints
    if (employeeId) {
      const employee = await this.employeesRepository.findOne({
        where: { id: employeeId },
      });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      const existingByEmployee = await this.usersRepository.findOne({
        where: { employeeId },
      });
      if (existingByEmployee) {
        throw new ConflictException('Employee already has a user account');
      }
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      employeeId: employeeId || undefined,
    });

    await this.usersRepository.save(newUser);

    return newUser;
  }

  /**
   * Transactional creation: Employee + User + Role in one atomic operation
   */
  async registerEmployee(dto: RegisterEmployeeDto) {
    // Pre-check uniqueness outside transaction to minimize locking
    const existingEmail = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingTab = await this.employeesRepository.findOne({
      where: { tabNumber: dto.tabNumber },
    });
    if (existingTab) {
      throw new ConflictException(
        'Employee with this tab number already exists',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // 1. Create Employee
      const employee = await manager.save(Employee, {
        tabNumber: dto.tabNumber,
        fullName: dto.fullName,
        hireDate: dto.hireDate,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
      });

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // 3. Create User
      const user = await manager.save(User, {
        email: dto.email,
        password: hashedPassword,
        employeeId: employee.id,
      });

      // 4. Assign Role
      await manager.save(UserRole, {
        userId: user.id,
        roleId: dto.roleId || 2, // default: employee
      });

      // Return without password
      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        employee,
      };
    });
  }

  public async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOneById(id);

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findOneByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Prevent changing employeeId if already set (optional security)
    if (
      updateUserDto.employeeId &&
      user.employeeId &&
      updateUserDto.employeeId !== user.employeeId
    ) {
      throw new BadRequestException('Cannot change employeeId once assigned');
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOneById(id);
  }

  public async deleteUser(id: number) {
    const user = await this.findOneById(id);
    await this.usersRepository.remove(user);
  }
}

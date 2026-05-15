import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/Department.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly repo: Repository<Department>,
  ) {}

  async findAll(): Promise<Department[]> {
    return this.repo.find({ relations: ['employees'] });
  }

  async findOne(id: number): Promise<Department> {
    const dept = await this.repo.findOne({
      where: { id },
      relations: ['employees'],
    });
    if (!dept)
      throw new NotFoundException(`Department with ID ${id} not found`);
    return dept;
  }

  async create(data: Partial<Department>): Promise<Department> {
    const dept = this.repo.create(data);
    return this.repo.save(dept);
  }

  async update(id: number, data: Partial<Department>): Promise<Department> {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }
}

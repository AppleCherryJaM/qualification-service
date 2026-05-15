import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Briefing } from './entities/Briefing.entity';

@Injectable()
export class BriefingsService {
  constructor(
    @InjectRepository(Briefing)
    private readonly repo: Repository<Briefing>,
  ) {}

  async findAll(filters?: {
    employeeId?: number;
    instructorId?: number;
    type?: string;
  }): Promise<Briefing[]> {
    const qb = this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.employee', 'e')
      .leftJoinAndSelect('b.instructor', 'i');

    if (filters?.employeeId)
      qb.andWhere('b.employeeId = :emp', { emp: filters.employeeId });
    if (filters?.instructorId)
      qb.andWhere('b.instructorId = :inst', { inst: filters.instructorId });
    if (filters?.type) qb.andWhere('b.type = :type', { type: filters.type });

    return qb.orderBy('b.date', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Briefing> {
    const b = await this.repo.findOne({
      where: { id },
      relations: ['employee', 'instructor'],
    });
    if (!b) throw new NotFoundException(`Briefing with ID ${id} not found`);
    return b;
  }

  async create(data: Partial<Briefing>): Promise<Briefing> {
    const b = this.repo.create(data);
    return this.repo.save(b);
  }

  async update(id: number, data: Partial<Briefing>): Promise<Briefing> {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Briefing with ID ${id} not found`);
    }
  }
}

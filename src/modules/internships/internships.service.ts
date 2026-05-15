/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Internship } from './entities/Internship.entity';

@Injectable()
export class InternshipsService {
  constructor(
    @InjectRepository(Internship)
    private readonly repo: Repository<Internship>,
  ) {}

  async findAll(filters?: {
    employeeId?: number;
    mentorId?: number;
  }): Promise<Internship[]> {
    const qb = this.repo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.employee', 'e')
      .leftJoinAndSelect('i.mentor', 'm');

    if (filters?.employeeId)
      qb.andWhere('i.employeeId = :emp', { emp: filters.employeeId });
    if (filters?.mentorId)
      qb.andWhere('i.mentorId = :ment', { ment: filters.mentorId });

    return qb.orderBy('i.startDate', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Internship> {
    const i = await this.repo.findOne({
      where: { id },
      relations: ['employee', 'mentor'],
    });
    if (!i) throw new NotFoundException(`Internship with ID ${id} not found`);
    return i;
  }

  async create(data: Partial<Internship>): Promise<Internship> {
    const i = this.repo.create(data);
    return this.repo.save(i);
  }

  async update(id: number, data: Partial<Internship>): Promise<Internship> {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Internship with ID ${id} not found`);
    }
  }
}

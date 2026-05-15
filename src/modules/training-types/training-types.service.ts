/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingType } from './entities/TrainingType.entity';

@Injectable()
export class TrainingTypesService {
  constructor(
    @InjectRepository(TrainingType)
    private readonly repo: Repository<TrainingType>,
  ) {}

  async findAll(): Promise<TrainingType[]> {
    return this.repo.find({ relations: ['courses'] });
  }

  async findOne(id: number): Promise<TrainingType> {
    const tt = await this.repo.findOne({
      where: { id },
      relations: ['courses'],
    });
    if (!tt)
      throw new NotFoundException(`TrainingType with ID ${id} not found`);
    return tt;
  }

  async create(data: Partial<TrainingType>): Promise<TrainingType> {
    const tt = this.repo.create(data);
    return this.repo.save(tt);
  }

  async update(id: number, data: Partial<TrainingType>): Promise<TrainingType> {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`TrainingType with ID ${id} not found`);
    }
  }
}

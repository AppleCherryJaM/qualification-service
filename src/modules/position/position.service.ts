/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from './entities/Position.entity';
import { CreatePositionDto } from './dtos/create-position.dto';
import { UpdatePositionDto } from './dtos/update-position.dto';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private readonly repo: Repository<Position>,
  ) {}

  async findAll(): Promise<Position[]> {
    return this.repo.find({ relations: ['employees'] });
  }

  async findOne(id: number): Promise<Position> {
    const pos = await this.repo.findOne({
      where: { id },
      relations: ['employees'],
    });
    if (!pos) throw new NotFoundException(`Position with ID ${id} not found`);
    return pos;
  }

  async create(data: CreatePositionDto): Promise<Position> {
    const pos = this.repo.create(data);
    const saved = await this.repo.save(pos);
    return (Array.isArray(saved) ? saved[0] : saved) as Position;
  }

  async update(id: number, data: UpdatePositionDto): Promise<Position> {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
  }
}

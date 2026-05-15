import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/Course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly repo: Repository<Course>,
  ) {}

  async findAll(): Promise<Course[]> {
    return this.repo.find({
      relations: ['trainingType', 'courseAssignments', 'tests'],
    });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.repo.findOne({
      where: { id },
      relations: [
        'trainingType',
        'courseAssignments',
        'tests',
        'tests.questions',
        'tests.questions.answers',
      ],
    });
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    return course;
  }

  async create(data: Partial<Course>): Promise<Course> {
    const course = this.repo.create(data);
    return this.repo.save(course);
  }

  async update(id: number, data: Partial<Course>): Promise<Course> {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}

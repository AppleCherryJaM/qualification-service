import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/Notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async findAll(filters?: { employeeId?: number; isRead?: boolean }) {
    const qb = this.repo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.employee', 'e')
      .leftJoinAndSelect('n.courseAssignment', 'ca');

    if (filters?.employeeId)
      qb.andWhere('n.employeeId = :emp', { emp: filters.employeeId });
    if (filters?.isRead !== undefined)
      qb.andWhere('n.isRead = :read', { read: filters.isRead });

    return qb.orderBy('n.createdAt', 'DESC').getMany();
  }

  async markAsRead(id: number) {
    await this.repo.update(id, { isRead: true });
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    return this.repo.save(this.repo.create(data));
  }
}

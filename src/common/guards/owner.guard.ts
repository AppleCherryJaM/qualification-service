/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    if (!user) {
      throw new ForbiddenException('Access denied: user not authenticated');
    }

    if (user.roles?.includes('admin') || user.roles?.includes('hr')) {
      return true;
    }

    const resourceId = parseInt(params.id, 10);
    if (isNaN(resourceId)) {
      return true;
    }

    const path = request.route?.path || '';

    if (path.includes('/employees/')) {
      if (user.employeeId && user.employeeId === resourceId) {
        return true;
      }
      throw new ForbiddenException(
        'You can only access your own employee record',
      );
    }

    if (path.includes('/users/')) {
      if (user.userId === resourceId) {
        return true;
      }
      throw new ForbiddenException('You can only access your own profile');
    }

    throw new ForbiddenException('Access denied');
  }
}

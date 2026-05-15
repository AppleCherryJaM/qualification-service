import { UseGuards, applyDecorators } from '@nestjs/common';
import { DepartmentGuard } from '../guards/department.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OwnerGuard } from '../guards/owner.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

type Guards =
  | typeof JwtAuthGuard
  | typeof RolesGuard
  | typeof OwnerGuard
  | typeof DepartmentGuard;

export function Secure(...roles: string[]) {
  const guards: Guards[] = [JwtAuthGuard, RolesGuard];

  if (roles.includes('employee') || roles.includes('manager')) {
    guards.push(OwnerGuard, DepartmentGuard);
  }

  return applyDecorators(UseGuards(...guards), Roles(...roles));
}

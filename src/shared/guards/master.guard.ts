import {
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { RoleUser, type User } from '@/prisma/generated'

export class OnlyMasterGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: User }>()

		const user = request?.user

		if (user.role === 'ADMIN') return true

		if (user.role !== RoleUser.MASTER)
			throw new ForbiddenException('Ты не имеешь прав мастера')

		return user.role === RoleUser.MASTER
	}
}

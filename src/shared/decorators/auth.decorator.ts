import { applyDecorators, UseGuards } from '@nestjs/common'

import { RoleUser } from '@/prisma/generated'

import { OnlyAdminGuard } from '../guards/admin.guard'
import { JwtAuthGuard } from '../guards/jwt.guard'
import { OnlyMasterGuard } from '../guards/master.guard'

export const Auth = (role: RoleUser = 'USER') => {
	const guards = {
		MASTER: [JwtAuthGuard, OnlyMasterGuard],
		ADMIN: [JwtAuthGuard, OnlyAdminGuard],
		USER: [JwtAuthGuard]
	}

	return applyDecorators(UseGuards(...guards[role]))
}

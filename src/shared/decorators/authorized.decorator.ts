import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import type { User } from '@/prisma/generated'

export const Authorized = createParamDecorator(
	(data: keyof User, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<{ user: User }>()

		const user = request?.user

		return data ? user[data] : user
	}
)

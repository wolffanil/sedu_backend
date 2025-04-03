import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { PrismaService } from '@/src/core/prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private prismaService: PrismaService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('JWT_SECRET')
		})
	}

	async validate({ id }: { id: string }) {
		const user = await this.prismaService.user.findUnique({
			where: { id }
		})

		if (!user) throw new ForbiddenException('Пользовтель не авторизован')

		return user
	}
}

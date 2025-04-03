import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import type { Response } from 'express'

import { UserService } from '../user/user.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
	EXPIRES_DAY_REFRESH_TOKEN = 7
	REFRESH_TOKEN_NAME = 'refreshToken_salon'

	public constructor(
		private readonly jwtService: JwtService,

		private readonly configService: ConfigService,
		private readonly userService: UserService
	) {}

	public async login(dto: LoginDto) {
		const user = await this.validateUser(dto)
		const tokens = await this.issueTokens(user.id)

		return { user, ...tokens }
	}

	public async register(dto: RegisterDto) {
		await this.existUser(dto.email, dto.phone)

		const user = await this.userService.create(dto)

		const tokens = await this.issueTokens(user.id)

		return { user, ...tokens }
	}

	private async existUser(email: string, phone: string) {
		const existEmail = await this.userService.getByEmail(email)

		if (existEmail)
			throw new ConflictException('Пользователь с таким email существует')

		const phoneExit = await this.userService.getByPhone(phone)

		if (phoneExit)
			throw new ConflictException(
				'Пользователь с таким номером телефона существует'
			)

		return
	}

	private async issueTokens(userId: string) {
		const data = { id: userId }

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(data, {
				expiresIn: '1h'
			}),
			this.jwtService.signAsync(data, {
				expiresIn: '7d'
			})
		])

		return { accessToken, refreshToken }
	}

	public async getNewTokens(refreshToken: string) {
		const result = await this.jwtService.verifyAsync(refreshToken)

		if (!result) throw new UnauthorizedException('refreshToken не валидный')

		const user = await this.userService.getById(result.id)

		const tokens = await this.issueTokens(user.id)

		return { user, ...tokens }
	}

	private async validateUser(dto: LoginDto) {
		const user = await this.userService.getByEmail(dto.email)

		if (!user || !(await verify(user.password, dto.password)))
			throw new NotFoundException('Пользователь не найден')

		user.password = undefined

		return user
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRES_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			domain: this.configService.getOrThrow<string>('SERVER_DOMAIN'),
			httpOnly: true,
			expires: expiresIn,
			sameSite: 'none',
			secure: true
		})
	}

	removeRefreshTokenFromResponce(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			expires: new Date(0),
			domain: this.configService.getOrThrow<string>('SERVER_DOMAIN'),
			secure: true,
			sameSite: 'none'
		})
	}
}

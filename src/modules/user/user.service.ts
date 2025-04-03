import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'

import { RoleUser } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { RegisterDto } from '../auth/dto/register.dto'

@Injectable()
export class UserService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async getByEmail(email: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				email
			},
			omit: {
				password: false
			}
		})

		return user
	}

	public async getByPhone(phone: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				phone
			}
		})

		return user
	}

	public async getById(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			}
		})

		return user
	}

	public async create(dto: RegisterDto) {
		const user = await this.prismaService.user.create({
			data: {
				name: dto.name,
				surname: dto.surname,
				email: dto.email,
				phone: dto.phone,
				password: await hash(dto.password)
			}
		})

		return user
	}

	public async getMasters() {
		const users = await this.prismaService.user.findMany({
			where: {
				role: RoleUser.MASTER
			},
			relationLoadStrategy: 'join',
			omit: {
				email: true,
				phone: true,
				birthday: true,
				bonuses: true
			},
			include: {
				services: {
					select: {
						procedure: {
							select: {
								title: true
							}
						}
					}
				}
			}
		})

		return { users }
	}
}

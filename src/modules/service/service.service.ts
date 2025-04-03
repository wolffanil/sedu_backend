import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'

import type { ServiceType, User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { ServiceDto } from './dto/service.dto'

@Injectable()
export class ServiceService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async create(user: User, dto: ServiceDto) {
		const existService = await this.prismaService.service.findUnique({
			where: {
				userId_procedureId: {
					userId: user.id,
					procedureId: dto.procedureId
				}
			}
		})

		if (existService)
			throw new ConflictException('Услуга с такой процедурой уже есть')

		const service = await this.prismaService.service.create({
			data: {
				serviceType: dto.service,
				address: dto.address,
				duration: dto.duration,
				user: {
					connect: {
						id: user.id
					}
				},
				procedure: {
					connect: {
						id: dto.procedureId
					}
				}
			}
		})

		return { service }
	}

	public async update(serviceId: string, user: User, dto: ServiceDto) {
		const existService = await this.prismaService.service.findUnique({
			where: {
				id: serviceId
			}
		})

		if (!existService) throw new NotFoundException('Услуга не найдена')

		if (existService?.userId !== user.id)
			throw new ForbiddenException('Эта услуга вам не принадлежит')

		const service = await this.prismaService.service.update({
			where: {
				id: serviceId
			},
			data: {
				procedure: {
					connect: {
						id: dto.procedureId
					}
				},
				address: dto.address,
				duration: dto.duration,
				serviceType: dto.service
			}
		})

		return { service }
	}

	public async delete(serviceId: string, user: User) {
		await this.prismaService.service.delete({
			where: {
				id: serviceId,
				userId: user.id
			}
		})

		return true
	}

	public async getMyServicesByServiceType(
		user: User,
		serviceType: ServiceType
	) {
		const services = await this.prismaService.service.findMany({
			where: {
				userId: user.id,
				serviceType
			},
			relationLoadStrategy: 'join',
			orderBy: {
				updatedAt: 'desc'
			},
			include: {
				procedure: {
					select: {
						title: true
					}
				}
			}
		})

		return { services }
	}
}

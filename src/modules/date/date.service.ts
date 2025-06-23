import {
	BadRequestException,
	ConflictException,
	Injectable
} from '@nestjs/common'

import type { User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { CreateDateDto } from './dto/create-date.dto'
import { UpdateDateDto } from './dto/update-date.dto'

@Injectable()
export class DateService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async create(user: User, dto: CreateDateDto) {
		const existDate = await this.findDate(user, dto.date)

		if (existDate) throw new ConflictException('Дата уже существеут')

		const date = await this.prismaService.date.create({
			data: {
				date: dto.date,
				service: {
					connect: {
						id: dto.serviceId
					}
				},
				user: {
					connect: {
						id: user.id
					}
				}
			}
		})

		return { date }
	}

	private async findDate(user: User, date: Date) {
		const existDate = await this.prismaService.date.findFirst({
			where: {
				userId: user.id,
				date
			}
		})

		return existDate
	}

	public async update(user: User, dto: UpdateDateDto, dateId: string) {
		const existDate = await this.findDate(user, dto.date)

		if (existDate) throw new ConflictException('Дата уже существеут')

		const date = await this.prismaService.date.update({
			where: {
				id: dateId
			},
			data: {
				date: dto.date
			}
		})

		return { date }
	}

	public async delete(dateId: string) {
		const existBook = await this.prismaService.book.count({
			where: {
				time: {
					dateId: dateId
				}
			}
		})

		if (!!existBook) {
			throw new BadRequestException('У даты есть бронирование')
		}

		await this.prismaService.date.delete({
			where: {
				id: dateId
			}
		})

		return true
	}

	// public async getByDate(dateTime: Date) {
	// 	const dates = await this.prismaService.date.findMany({
	// 		where: {
	// 			date: new Date(dateTime)
	// 		}
	// 	})

	// 	return { dates }
	// }

	public async getByProcedureId(procedureId: string) {
		const currentDate = new Date()

		const dates = await this.prismaService.service.findMany({
			where: {
				procedureId
			},
			include: {
				dates: {
					where: {
						date: {
							gt: currentDate
						}
					},
					select: {
						id: true,
						date: true
					},
					orderBy: {
						date: 'asc'
					}
				}
			}
		})

		const procedureDates = dates.flatMap(item => item.dates)

		return { procedureDates }
	}

	public async getMyDates(user: User) {
		const dates = await this.prismaService.date.findMany({
			where: {
				userId: user.id
			},
			select: {
				date: true,
				id: true
			},
			orderBy: {
				date: 'asc'
			}
		})

		return { dates }
	}
}

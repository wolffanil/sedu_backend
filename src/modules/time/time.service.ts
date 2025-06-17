import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'

import type { User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { CreateTimeDto } from './dto/create-time.dto'
import { UpdateTimeDto } from './dto/update-time.dto'

@Injectable()
export class TimeService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async getTimesByDateId(dateId: string) {
		const times = await this.prismaService.time.findMany({
			where: {
				dateId
			},
			relationLoadStrategy: 'join',
			include: {
				date: {
					select: {
						service: {
							select: {
								address: true,
								procedure: {
									select: {
										title: true
									}
								}
							}
						}
					}
				}
			},
			orderBy: {
				time: 'asc'
			},
			omit: {
				userId: true
			}
		})

		return { times }
	}

	public async getTimesByDateTime(dateTime: string) {
		const times = await this.prismaService.time.findMany({
			where: {
				date: {
					date: new Date(dateTime)
				}
			},
			relationLoadStrategy: 'join',
			include: {
				date: {
					select: {
						service: {
							select: {
								address: true,
								procedure: {
									select: {
										title: true
									}
								}
							}
						}
					}
				}
			},
			orderBy: {
				time: 'asc'
			}
		})

		return { times }
	}

	public async create(user: User, dto: CreateTimeDto) {
		const existTime = await this.prismaService.time.findUnique({
			where: {
				time_dateId: {
					time: dto.time,
					dateId: dto.dateId
				}
			}
		})

		if (existTime) throw new ConflictException('Время на эту дату уже есть')

		const time = await this.prismaService.time.create({
			data: {
				time: dto.time,
				user: {
					connect: {
						id: user.id
					}
				},
				date: {
					connect: {
						id: dto.dateId
					}
				}
			}
		})

		return { time }
	}

	public async update(timeId: string, dto: UpdateTimeDto) {
		const existTime = await this.prismaService.time.findUnique({
			where: {
				id: timeId
			}
		})

		if (!existTime) throw new NotFoundException('Время не найдена')

		if (existTime.time === dto.time) {
			return { time: existTime }
		}

		const sameTime = await this.prismaService.time.findUnique({
			where: {
				time_dateId: {
					time: dto.time,
					dateId: existTime.dateId
				}
			}
		})

		if (sameTime) throw new ConflictException('Время на эту дату уже есть ')

		const time = await this.prismaService.time.update({
			where: {
				id: timeId
			},
			data: {
				time: dto.time
			}
		})

		return { time }
	}

	public async delete(timeId: string) {
		await this.prismaService.time.delete({
			where: {
				id: timeId
			}
		})

		return true
	}
}

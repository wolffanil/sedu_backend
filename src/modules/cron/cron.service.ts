import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { PrismaService } from '@/src/core/prisma/prisma.service'

@Injectable()
export class CronService {
	public constructor(private readonly prismaService: PrismaService) {}

	@Cron('0 0 * * *')
	async manageBonuses() {
		const previousDayStart = new Date()
		previousDayStart.setDate(previousDayStart.getDate() - 1)
		previousDayStart.setHours(0, 0, 0, 0)

		const previousDayEnd = new Date(previousDayStart)
		previousDayEnd.setDate(previousDayStart.getDate() + 1)

		const bookings = await this.prismaService.book.findMany({
			where: {
				isActiveBonuses: true,
				createdAt: {
					gte: previousDayStart,
					lt: previousDayEnd
				}
			},
			select: {
				userId: true,
				time: {
					select: {
						date: {
							select: {
								service: {
									select: {
										procedure: {
											select: {
												price: true
											}
										}
									}
								}
							}
						}
					}
				}
			}
		})

		await Promise.all(
			bookings.map(async book => {
				try {
					const user = await this.prismaService.user.findUnique({
						where: {
							id: book.userId
						}
					})

					if (user?.id) {
						const price =
							Number(book.time.date.service.procedure.price) *
							0.05
						await this.prismaService.user.update({
							where: {
								id: book.userId
							},
							data: {
								bonuses: {
									increment: price
								}
							}
						})
					}
				} catch {}
			})
		)
	}
}

import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'

import type { User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { BookDto } from './dto/book.dto'

@Injectable()
export class BookService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async getBookByTimeId(timeId: string) {
		const book = await this.prismaService.book.findUnique({
			where: {
				timeId
			},
			relationLoadStrategy: 'join',
			include: {
				time: {
					select: {
						time: true,
						date: {
							select: {
								id: true,
								date: true,
								service: {
									select: {
										procedure: {
											select: {
												title: true
											}
										}
									}
								}
							}
						}
					}
				},
				user: {
					select: {
						surname: true,
						name: true,
						phone: true
					}
				}
			}
		})

		return { book }
	}

	public async getMyBooks(lastVisits: boolean, user: User) {
		const currentDate = new Date()

		const whereCondition: any = {}

		if (lastVisits) {
			whereCondition.time = {
				time: {
					date: {
						date: {
							lt: currentDate
						}
					}
				}
			}
		} else {
			whereCondition.time = {
				time: {
					date: {
						date: {
							gte: currentDate
						}
					}
				}
			}
		}

		let books = await this.prismaService.book.findMany({
			where: {
				userId: user.id,
				...whereCondition.time
			},
			orderBy: {
				createdAt: 'desc'
			},
			relationLoadStrategy: 'join',
			include: {
				time: {
					select: {
						time: true,
						date: {
							select: {
								date: true,
								service: {
									select: {
										id: true,
										address: true,
										procedure: {
											select: {
												price: true,
												service: true,
												id: true,
												title: true
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

		// if (lastVisits) {
		// 	const oneHourAgo = new Date(currentDate.getTime() - 60 * 60 * 1000)

		// 	const hours = String(oneHourAgo.getHours()).padStart(2, '0')
		// 	books = books.filter(book => {
		// 		const [h, minutes] = book.time.time.split(':')
		// 		return Number(h) <= Number(hours)
		// 	})
		// } else {
		// 	const currentHour = new Date(currentDate.getTime())

		// 	const hours = String(currentHour.getHours()).padStart(2, '0')
		// 	books = books.filter(book => {
		// 		if (
		// 			book.createdAt.toString().split('T')[0] ==
		// 			currentDate.toString().split('T')[0]
		// 		)
		// 			return true
		// 		const [h, minutes] = book.time.time.split(':')
		// 		return Number(h) >= Number(hours)
		// 	})
		// }

		return { books }
	}

	private async existBook(timeId: string) {
		const book = await this.prismaService.book.findUnique({
			where: {
				timeId
			}
		})

		return book
	}

	public async create(user: User, dto: BookDto) {
		const existBook = await this.existBook(dto.timeId)

		if (existBook)
			throw new ConflictException('Бранирование на это время уже есть')

		const book = await this.prismaService.book.create({
			data: {
				time: {
					connect: {
						id: dto.timeId
					}
				},
				isActiveBonuses: dto?.isActiveBonuses ?? false,
				user: {
					connect: {
						id: user.id
					}
				}
			},
			select: {
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

		if (dto.isActiveBonuses) {
			const precent = Number(book.time.date.service.procedure.price) * 0.1

			await this.prismaService.user.update({
				where: {
					id: user.id
				},
				data: {
					bonuses: {
						decrement: precent
					}
				}
			})
		}

		await this.prismaService.time.update({
			where: {
				id: dto.timeId
			},
			data: {
				isBusy: true
			}
		})

		return { book }
	}

	public async cancel(bookId: string, user: User) {
		const existBook = await this.prismaService.book.findUnique({
			where: {
				id: bookId
			}
		})

		if (!existBook)
			throw new NotFoundException('Бранирование на это время не найдено')

		const book = await this.prismaService.book.delete({
			where: {
				id: bookId
			},
			select: {
				isActiveBonuses: true,
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

		if (book?.isActiveBonuses) {
			const precent = Number(book.time.date.service.procedure.price) * 0.1

			await this.prismaService.user.update({
				where: {
					id: user.id
				},
				data: {
					bonuses: {
						increment: precent
					}
				}
			})
		}

		await this.prismaService.time.update({
			where: {
				id: existBook.timeId
			},
			data: {
				isBusy: false
			}
		})

		return true
	}
}

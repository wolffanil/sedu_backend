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

		const books = await this.prismaService.book.findMany({
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
				bonuses: dto?.bonuses ?? 0,
				isActiveBonuses: dto?.isActiveBonuses ?? false,
				user: {
					connect: {
						id: user.id
					}
				}
			}
		})

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

	public async cancel(bookId: string) {
		const existBook = await this.prismaService.book.findUnique({
			where: {
				id: bookId
			}
		})

		if (!existBook)
			throw new NotFoundException('Бранирование на это время не найдено')

		await this.prismaService.book.delete({
			where: {
				id: bookId
			}
		})

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

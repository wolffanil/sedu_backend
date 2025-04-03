import { Injectable, NotFoundException } from '@nestjs/common'

import type { User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { ReviewCreateDto } from './dto/create-review.dto'
import { ReviewUpdateDto } from './dto/update-review.dto'

@Injectable()
export class ReviewService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async create(user: User, dto: ReviewCreateDto) {
		const review = await this.prismaService.review.upsert({
			where: {
				userId_serviceId: {
					userId: user.id,
					serviceId: dto.serviceId
				}
			},
			update: {
				text: dto.text
			},
			create: {
				service: {
					connect: {
						id: dto.serviceId
					}
				},
				user: {
					connect: {
						id: user.id
					}
				},
				text: dto.text
			}
		})

		return { review }
	}

	public async update(reviewId: string, dto: ReviewUpdateDto, user: User) {
		const review = await this.prismaService.review.upsert({
			where: {
				id: reviewId
			},
			update: {
				text: dto.text
			},
			create: {
				service: {
					connect: {
						id: dto.serviceId
					}
				},
				user: {
					connect: {
						id: user.id
					}
				},
				text: dto.text
			}
		})

		return { review }
	}

	public async delete(reviewId: string, user: User) {
		await this.prismaService.review.delete({
			where: {
				id: reviewId,
				userId: user.id
			}
		})

		return true
	}

	public async get(isSlider: boolean) {
		const reviews = await this.prismaService.review.findMany({
			relationLoadStrategy: 'join',
			include: {
				user: {
					select: {
						photo: true,
						name: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			...(isSlider && { take: 9 })
		})

		return { reviews }
	}
}

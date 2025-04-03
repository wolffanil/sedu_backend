import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query
} from '@nestjs/common'

import type { User } from '@/prisma/generated'
import { Auth } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { UuidValidationPipe } from '@/src/shared/pipes/uuid-validation.pipe'

import { ReviewCreateDto } from './dto/create-review.dto'
import { ReviewUpdateDto } from './dto/update-review.dto'
import { ReviewService } from './review.service'

@Controller('reviews')
export class ReviewController {
	constructor(private readonly reviewService: ReviewService) {}

	@Get()
	async get(@Query('is-slider') isSlider: boolean) {
		return this.reviewService.get(isSlider)
	}

	@Post()
	@Auth()
	async create(@Authorized() user: User, @Body() dto: ReviewCreateDto) {
		return this.reviewService.create(user, dto)
	}

	@Patch(':reviewId')
	@Auth()
	async update(
		@Authorized() user: User,
		@Param('reviewId', UuidValidationPipe) reviewId: string,
		@Body() dto: ReviewUpdateDto
	) {
		return this.reviewService.update(reviewId, dto, user)
	}

	@Delete(':reviewId')
	@Auth()
	async delete(
		@Param('reviewId', UuidValidationPipe) reviewId: string,
		@Authorized() user: User
	) {
		return this.reviewService.delete(reviewId, user)
	}
}

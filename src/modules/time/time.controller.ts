import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'

import type { User } from '@/prisma/generated'
import { Auth } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { UuidValidationPipe } from '@/src/shared/pipes/uuid-validation.pipe'

import { CreateTimeDto } from './dto/create-time.dto'
import { UpdateTimeDto } from './dto/update-time.dto'
import { TimeService } from './time.service'

@Controller('times')
export class TimeController {
	public constructor(private readonly timeService: TimeService) {}

	@Get('get-by-date/:dateId')
	async getByDate(@Param('dateId', UuidValidationPipe) dateId: string) {
		return this.timeService.getTimesByDateId(dateId)
	}

	@Get('get-by-date-time/:dateTime')
	async getByDateTime(@Param('dateTime') dateTime: string) {
		return this.timeService.getTimesByDateTime(dateTime)
	}

	@Post()
	@Auth('MASTER')
	async create(@Authorized() user: User, @Body() dto: CreateTimeDto) {
		return this.timeService.create(user, dto)
	}

	@Patch(':timeId')
	@Auth('MASTER')
	async update(
		@Param('timeId', UuidValidationPipe) timeId: string,
		@Body() dto: UpdateTimeDto
	) {
		return this.timeService.update(timeId, dto)
	}

	@Delete(':timeId')
	@Auth('MASTER')
	async delete(@Param('timeId', UuidValidationPipe) timeId: string) {
		return this.timeService.delete(timeId)
	}
}

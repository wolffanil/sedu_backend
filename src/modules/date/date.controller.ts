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

import { DateService } from './date.service'
import { CreateDateDto } from './dto/create-date.dto'
import { UpdateDateDto } from './dto/update-date.dto'

@Controller('dates')
export class DateController {
	constructor(private readonly dateService: DateService) {}

	@Get('get-by-procedure/:procedureId')
	async getByProcedureId(
		@Param('procedureId', UuidValidationPipe) procedureId: string
	) {
		return this.dateService.getByProcedureId(procedureId)
	}

	// @Get('get-by-date/:dateTime')
	// async getByDate(@Param('dateTime') dateTime: Date) {
	// 	return this.dateService.getByDate(dateTime)
	// }

	@Get('get-my')
	@Auth('MASTER')
	async getMy(@Authorized() user: User) {
		return this.dateService.getMyDates(user)
	}

	@Post()
	@Auth('MASTER')
	async create(@Authorized() user: User, @Body() dto: CreateDateDto) {
		return this.dateService.create(user, dto)
	}

	@Patch(':dateId')
	@Auth('MASTER')
	async update(
		@Param('dateId', UuidValidationPipe) dateId: string,
		@Authorized() user: User,
		@Body() dto: UpdateDateDto
	) {
		return this.dateService.update(user, dto, dateId)
	}

	@Delete(':dateId')
	@Auth('MASTER')
	async delete(@Param('dateId', UuidValidationPipe) dateId: string) {
		return this.dateService.delete(dateId)
	}
}

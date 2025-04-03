import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'

import type { ServiceType, User } from '@/prisma/generated'
import { Auth } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { UuidValidationPipe } from '@/src/shared/pipes/uuid-validation.pipe'

import { ServiceDto } from './dto/service.dto'
import { ServiceService } from './service.service'

@Controller('services')
export class ServiceController {
	public constructor(private readonly serviceService: ServiceService) {}

	@Get('get-by-service/:serviceType')
	@Auth('MASTER')
	async getByServiceType(
		@Param('serviceType') serviceType: ServiceType,
		@Authorized() user: User
	) {
		return this.serviceService.getMyServicesByServiceType(user, serviceType)
	}

	@Post()
	@Auth('MASTER')
	async create(@Authorized() user: User, @Body() dto: ServiceDto) {
		return this.serviceService.create(user, dto)
	}

	@Patch(':serviceId')
	@Auth('MASTER')
	async update(
		@Authorized() user: User,
		@Param('serviceId', UuidValidationPipe) serviceId: string,
		@Body() dto: ServiceDto
	) {
		return this.serviceService.update(serviceId, user, dto)
	}

	@Delete(':serviceId')
	@Auth('MASTER')
	async delete(
		@Authorized() user: User,
		@Param('serviceId', UuidValidationPipe) serviceId: string
	) {
		return this.serviceService.delete(serviceId, user)
	}
}

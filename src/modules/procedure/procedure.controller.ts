import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import type { ServiceType } from '@/prisma/generated'
import { Auth } from '@/src/shared/decorators/auth.decorator'
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe'
import { UuidValidationPipe } from '@/src/shared/pipes/uuid-validation.pipe'

import { ProcedureDto } from './dto/procedure.dto'
import { ProcedureService } from './procedure.service'

@Controller('procedures')
export class ProcedureController {
	public constructor(private readonly procedureService: ProcedureService) {}

	@Get('get-by-service/:service')
	async(@Param('service') serviceType: ServiceType) {
		return this.procedureService.getAllByService(serviceType)
	}

	@Post()
	@Auth('MASTER')
	async create(@Body() dto: ProcedureDto) {
		return this.procedureService.create(dto)
	}

	@Patch(':procuderId')
	@Auth('MASTER')
	async update(
		@Param('procuderId', UuidValidationPipe) procedureId: string,
		@Body() dto: ProcedureDto
	) {
		return this.procedureService.update(procedureId, dto)
	}

	@Delete(':procuderId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@Auth('MASTER')
	async delete(@Param('procuderId', UuidValidationPipe) procedureId: string) {
		return this.procedureService.delete(procedureId)
	}

	@Post('upload-photo')
	@Auth('MASTER')
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FileInterceptor('photo'))
	async changeAvatar(
		@UploadedFile(new FileValidationPipe()) photo: Express.Multer.File
	) {
		return this.procedureService.uploadPhoto(photo)
	}
}

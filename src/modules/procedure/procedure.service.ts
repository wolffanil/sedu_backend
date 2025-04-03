import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import * as sharp from 'sharp'

import { ServiceType } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { StorageService } from '../libs/storage/storage.service'

import { ProcedureDto } from './dto/procedure.dto'

@Injectable()
export class ProcedureService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService
	) {}

	private async existTitle(title: string) {
		const existTitle = await this.prismaService.procedure.findUnique({
			where: {
				title
			}
		})

		if (existTitle)
			throw new ConflictException('Процедура с таким название уже есть')

		return
	}

	public async create(dto: ProcedureDto) {
		await this.existTitle(dto.title)

		const procuder = await this.prismaService.procedure.create({
			data: {
				photo: dto.photo,
				price: dto.price,
				title: dto.title,
				service: dto.service
			}
		})

		return { procuder }
	}

	public async update(procuderId: string, dto: ProcedureDto) {
		const existProcuder = await this.prismaService.procedure.findUnique({
			where: {
				id: procuderId
			}
		})

		if (!existProcuder) throw new NotFoundException('Процедура не найдена')

		if (existProcuder.title !== dto.title) {
			await this.existTitle(dto.title)
		}

		const procuder = await this.prismaService.procedure.update({
			where: {
				id: procuderId
			},
			data: {
				photo: dto.photo,
				price: dto.price,
				title: dto.title,
				service: dto.service
			}
		})

		return { procuder }
	}

	public async delete(procedureId: string) {
		await this.removePhoto(procedureId)

		await this.prismaService.procedure.delete({
			where: {
				id: procedureId
			}
		})

		return true
	}

	public async getAllByService(service: ServiceType) {
		const procuders = await this.prismaService.procedure.findMany({
			where: {
				service
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return { procuders }
	}

	public async uploadPhoto(file: Express.Multer.File) {
		const buffer = file.buffer

		const fileName = `/procuders/${file.originalname + '-' + Date.now()}.webp`

		if (file.filename && file.filename.endsWith('.gif')) {
			const proccessedBuffer = await sharp(buffer, { animated: true })
				.resize(600, 600)
				.webp()
				.toBuffer()

			await this.storageService.upload(
				proccessedBuffer,
				fileName,
				'image/webp'
			)
		} else {
			const proccessedBuffer = await sharp(buffer)
				.resize(600, 600)
				.webp()
				.toBuffer()

			await this.storageService.upload(
				proccessedBuffer,
				fileName,
				'image/webp'
			)
		}

		return { photo: fileName }
	}

	public async removePhoto(procedureId: string) {
		const procedure = await this.prismaService.procedure.findUnique({
			where: {
				id: procedureId
			}
		})

		if (!procedure.photo) {
			return
		}

		await this.storageService.remove(procedure.photo)

		return true
	}
}

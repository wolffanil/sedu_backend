import { ConflictException, Injectable } from '@nestjs/common'
import * as sharp from 'sharp'

import type { User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { StorageService } from '../../libs/storage/storage.service'
import { UserService } from '../user.service'

import { ChangeInfoDto } from './dto/change-info.dto'

@Injectable()
export class ProfileService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService,
		private readonly userService: UserService
	) {}

	public async changeAvatar(user: User, file: Express.Multer.File) {
		if (user.photo && user.photo !== '/photos/default.webp') {
			await this.removeAvatar(user)
		}

		const buffer = file.buffer

		const fileName = `/photos/${user.name + '-' + Date.now()}.webp`

		if (file.filename && file.filename.endsWith('.gif')) {
			const proccessedBuffer = await sharp(buffer, { animated: true })
				.resize(442, 442)
				.webp()
				.toBuffer()

			await this.storageService.upload(
				proccessedBuffer,
				fileName,
				'image/webp'
			)
		} else {
			const proccessedBuffer = await sharp(buffer)
				.resize(442, 442)
				.webp()
				.toBuffer()

			await this.storageService.upload(
				proccessedBuffer,
				fileName,
				'image/webp'
			)
		}

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				photo: fileName
			}
		})

		return { photo: fileName }
	}

	public async removeAvatar(user: User) {
		if (!user.photo || user?.photo === '/photos/default.webp') {
			return
		}

		await this.storageService.remove(user.photo)

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				photo: null
			}
		})

		return true
	}

	public async changeInfo(user: User, dto: ChangeInfoDto) {
		if (user.email !== dto.email) {
			const existEmail = await this.userService.getByEmail(dto.email)

			if (existEmail) throw new ConflictException('Почта уже занета')
		}

		if (user.phone !== dto.phone) {
			const existPhone = await this.userService.getByPhone(dto.phone)

			if (existPhone)
				throw new ConflictException('Номер телефона уже занет')
		}

		const profile = await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				email: dto.email,
				phone: dto.phone,
				name: dto.name,
				surname: dto.surname,
				birthday: dto?.birthday ?? null
			}
		})

		return { profile }
	}
}

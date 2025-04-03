import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator'

import { ServiceType } from '@/prisma/generated'

export class ServiceDto {
	@IsEnum(ServiceType, {
		message:
			'Тип Услуги должна быть одна из: ' +
			Object.values(ServiceType).join(', ')
	})
	service: ServiceType

	@IsUUID(null, { message: 'Формат id должен быть валидный' })
	@IsNotEmpty({ message: 'id не может быть пустой' })
	procedureId: string

	@IsString({ message: 'Адрес должен быть' })
	@IsNotEmpty({ message: 'Адрес не может быть пустым' })
	address: string

	@IsString({ message: 'Продолжительность должена быть' })
	@IsNotEmpty({ message: 'Продолжительность не может быть пустым' })
	duration: string
}

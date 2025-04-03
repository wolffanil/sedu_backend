import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'

import { ServiceType } from '@/prisma/generated'

export class ProcedureDto {
	@IsString({ message: 'Название процедуры должно быть' })
	@IsNotEmpty({ message: 'Название процедуры не должна быть пустой' })
	title: string

	@IsNumber({}, { message: 'Цена должна быть' })
	@Min(100, { message: 'Цена должна быть не меньше 100 рублей' })
	price: number

	@IsString({ message: 'Фото процедуры должно быть' })
	@IsNotEmpty({ message: 'Фото процедуры не должна быть пустой' })
	photo: string

	@IsEnum(ServiceType, {
		message:
			'Тип Услуги должна быть одна из:' +
			Object.values(ServiceType).join(', ')
	})
	service: ServiceType
}

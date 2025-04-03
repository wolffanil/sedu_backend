import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, IsUUID, MinDate } from 'class-validator'

export class CreateDateDto {
	@IsUUID(null, { message: 'Формат id должен быть валидный' })
	@IsNotEmpty({ message: 'id не может быть пустой' })
	serviceId: string

	@IsNotEmpty({ message: 'Дата обязательна' })
	@Transform(({ value }) => new Date(value))
	@IsDate({ message: 'Неверный формат даты' })
	@MinDate(new Date(), {
		message: 'Дата не может быть в прошлом'
	})
	date: Date
}

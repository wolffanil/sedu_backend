import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, MinDate } from 'class-validator'

export class UpdateDateDto {
	@IsNotEmpty({ message: 'Дата  обязательна' })
	@Transform(({ value }) => new Date(value))
	@IsDate({ message: 'Неверный формат даты' })
	@MinDate(new Date(), {
		message: 'Дата не может быть в прошлом'
	})
	date: Date
}

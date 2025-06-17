import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator'

export class CreateTimeDto {
	@IsUUID(null, { message: 'Формат id должен быть валидный' })
	@IsNotEmpty({ message: 'id не может быть пустой' })
	dateId: string

	@IsString({ message: 'Время должно быть' })
	@Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: 'Время должно быть в формате ЧЧ:MM'
	})
	time: string
}

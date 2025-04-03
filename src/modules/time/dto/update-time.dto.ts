import { IsString, Matches } from 'class-validator'

export class UpdateTimeDto {
	@IsString({ message: 'Время должно быть' })
	@Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: 'Время должно быть в формате HH:MM'
	})
	time: string
}

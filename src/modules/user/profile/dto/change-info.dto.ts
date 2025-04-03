import { Transform } from 'class-transformer'
import {
	IsDate,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxDate,
	MinDate
} from 'class-validator'

export class ChangeInfoDto {
	@IsString()
	@IsEmail({}, { message: 'Почта должна быть валидной' })
	email: string

	@IsString({ message: 'Имя должно быть' })
	@IsNotEmpty({ message: 'Имя не должно быть пустой' })
	name: string

	@IsString({ message: 'Фамилия должна быть' })
	@IsNotEmpty({ message: 'Фамилия не должна быть пустой' })
	surname: string

	@Transform(({ value }) => value.replace(/[^\d+]/g, ''))
	@Matches(/^(\+7|8)\d{10}$/, {
		message: 'Введите номер в формате +79000000000 или 89000000000'
	})
	@IsNotEmpty({ message: 'Номер телефона не может быть пустым' })
	phone: string

	@IsOptional()
	@IsNotEmpty({ message: 'Дата рождения обязательна' })
	@Transform(({ value }) => new Date(value))
	@IsDate({ message: 'Неверный формат даты рождения' })
	@MinDate(new Date('1900-01-01'), {
		message: 'Дата рождения не может быть раньше 1 января 1900 года'
	})
	@MaxDate(new Date(), {
		message: 'Дата рождения не может быть в будущем'
	})
	birthday: Date
}

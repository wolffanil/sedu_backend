import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator'

export class ReviewCreateDto {
	@IsUUID(null, { message: 'Формат id должен быть валидный' })
	@IsNotEmpty({ message: 'id не может быть пустой' })
	serviceId: string

	@IsString({ message: 'Отзыв должен быть' })
	@IsNotEmpty({ message: 'Отзыв не может быть пустым' })
	@MinLength(20, { message: 'Отзыв должен составить минимум 20 символов' })
	text: string
}

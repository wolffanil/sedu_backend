import {
	type ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform
} from '@nestjs/common'

import { validateFileFormat } from '../utils/file.util'

@Injectable()
export class FileValidationPipe implements PipeTransform {
	public async transform(
		value: Express.Multer.File,
		metadata: ArgumentMetadata
	) {
		if (!value?.originalname) {
			throw new BadRequestException('Файл не загружен')
		}

		const { originalname } = value

		const allowedFormats = ['jpg', 'jpeg', 'webp', 'gif']
		const isFileFormatValid = validateFileFormat(
			originalname,
			allowedFormats
		)

		if (!isFileFormatValid)
			throw new BadRequestException('Неподдерживаемый формат файла')

		if (value.buffer) {
			if (value.buffer.length > 10 * 1024 * 1024) {
				throw new BadRequestException('Размер файла превышает 10 мб')
			}
			return value
		}

		return value
	}
}

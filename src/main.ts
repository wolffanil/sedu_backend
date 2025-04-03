import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'

import { CoreModule } from './core/core.module'
import { ValidationException } from './validation.exception'
import { ValidationFilter } from './validation.filter'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(CoreModule)

	const config = app.get(ConfigService)

	app.useGlobalFilters(new ValidationFilter())

	app.use(cookieParser())

	app.setGlobalPrefix('api/v1')

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			exceptionFactory: errors => {
				const formatErrors = (errors, parentPath = '') => {
					return errors.flatMap(error => {
						if (error.children?.length) {
							return formatErrors(
								error.children,
								`${parentPath}${error.property}.`
							)
						}

						return {
							field: `${parentPath}${error.property}`,
							message: Object.values(error.constraints).at(-1)
						}
					})
				}

				const formattedErrors = formatErrors(errors)
				return new ValidationException(formattedErrors)
			}
		})
	)

	app.use(helmet())
	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
		credentials: true
	})

	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
bootstrap()

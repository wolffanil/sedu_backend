import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { AuthModule } from '../modules/auth/auth.module'
import { BookModule } from '../modules/book/book.module'
import { CronModule } from '../modules/cron/cron.module'
import { DateModule } from '../modules/date/date.module'
import { StorageModule } from '../modules/libs/storage/storage.module'
import { ProcedureModule } from '../modules/procedure/procedure.module'
import { ReviewModule } from '../modules/review/review.module'
import { ServiceModule } from '../modules/service/service.module'
import { TimeModule } from '../modules/time/time.module'
import { ProfileModule } from '../modules/user/profile/profile.module'
import { UserModule } from '../modules/user/user.module'
import { IS_DEV_ENV } from '../shared/utils/is-dev.util'

import { getThrottlerConfig } from './config/throttler.config'
import { PrismaModule } from './prisma/prisma.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		ThrottlerModule.forRoot([getThrottlerConfig()]),
		AuthModule,
		ProfileModule,
		StorageModule,
		ProcedureModule,
		ServiceModule,
		ReviewModule,
		CronModule,
		TimeModule,
		BookModule,
		DateModule,
		UserModule,
		PrismaModule
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		}
	]
})
export class CoreModule {}

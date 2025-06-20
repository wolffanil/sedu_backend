import { Module } from '@nestjs/common'

import { UserService } from '../user.service'

import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'

@Module({
	controllers: [ProfileController],
	providers: [ProfileService, UserService]
})
export class ProfileModule {}

import { Controller, Get } from '@nestjs/common'

import { UserService } from './user.service'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('get-masters')
	async getMasters() {
		return this.userService.getMasters()
	}
}

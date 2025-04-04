import { 
    Controller, 
    Post, 
    Body, 
    HttpCode,
    HttpStatus,
    UseGuards,
    Req 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { PassportLocalGuard } from './passport-auth.guard';

@Controller('auth-passport')
export class PassportAuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    @UseGuards(PassportLocalGuard)
    signIn(@Req() req){
        return this.authService.signInV2(req.user)
    }
}

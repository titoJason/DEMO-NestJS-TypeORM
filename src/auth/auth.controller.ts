import { 
    Controller, 
    Post, 
    Body, 
    HttpCode,
    HttpStatus 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() signInDto: SignInDto){
        return this.authService.signIn(signInDto.email, signInDto.password);
    }
}

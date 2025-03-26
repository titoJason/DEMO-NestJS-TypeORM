import { 
    Injectable, 
    CanActivate, 
    ExecutionContext, 
    UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = request.headers.authorization?.split(' ')[1] as string;

        if (!token) throw new UnauthorizedException();

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    // brb : this should be inside ENV variable
                    secret: 'DEMO'
                }
            )

            request['user'] = payload;
        } catch (error) {
            throw new UnauthorizedException();
        }

        return true;
    }
}


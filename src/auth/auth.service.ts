import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(email: string, password: string) {
        const getUsersByEmail = await this.userService.findAll({ email });

        if (!getUsersByEmail.length) throw new NotFoundException('Email not found');

        const {
            password: user_password,
            ...rest_of_user_data
        } = getUsersByEmail[0]; 
        
        const isPasswordCorrect = await compare(password, user_password);

        if (!isPasswordCorrect) throw new UnauthorizedException();

        const token = await this.jwtService.signAsync(rest_of_user_data);

        return { token }
    }

    // For Passport-Local Strategy
    async validateUser(email: string, password: string) {
        const getUsersByEmail = await this.userService.findAll({ email });

        if (!getUsersByEmail.length) throw new NotFoundException('Email not found');
        
        const {
            password: user_password,
            ...rest_of_user_data
        } = getUsersByEmail[0]; 
        
        const isPasswordCorrect = await compare(password, user_password);

        if (!isPasswordCorrect) throw new UnauthorizedException();

        return rest_of_user_data;
    }

    async signInV2(user_data: Omit<User, 'password'>) {
        const token = await this.jwtService.signAsync(user_data);

        return { token }
    }
}

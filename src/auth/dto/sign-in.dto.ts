import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
    @ApiProperty({
        description: 'Email of the User. This will served as the username.',
        example: "jasonababat@mail.com"
    })
    email: string;

    @ApiProperty({
        description: 'Password of the User.',
        example: "jasonababat"
    })
    password: string;
}
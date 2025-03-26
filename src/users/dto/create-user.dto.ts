import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
    @ApiProperty({
        description: 'First Name of the User',
        example: 'Jason'
    })
    first_name: string

    @ApiProperty({
        description: 'Last Name of the User',
        example: 'Ababat'
    })
    last_name: string

    @ApiProperty({
        description: 'Age of the User',
        example: 30
    })
    age: number

    @ApiProperty({
        description: 'Email of the User. It must be UNIQUE',
        example: 'jasonababat@mail.com'
    })
    email: string

    @ApiProperty({
        description: 'Password of the User',
        example: 'jasonababat'
    })
    password: string
}

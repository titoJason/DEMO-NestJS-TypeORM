import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 15
    })
    first_name: string;

    @Column({
        length: 15
    })
    last_name: string;

    @Column('int')
    age: number;

    @Column({
        length: 25,
        unique: true
    })
    email: string;

    @Column({
        length: 60
    })
    password: string;
}

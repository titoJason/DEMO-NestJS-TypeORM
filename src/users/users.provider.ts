import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';

export const userProvider = [
    {
        provide: 'USER_REPOSITORY',
        useFactory: (dataSource: DataSource) => {
            return dataSource.getRepository(User)
        },
        inject: ['DATA_SOURCE']
    }
]
import { DataSource } from 'typeorm';

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            const dataSource = new DataSource({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'root',
                password: 'password',
                database: 'demoDB',
                // brb
                // synchronize: true,
                entities: [
                    __dirname + '/../**/*.entity{.ts,.js}',
                ],
            });

            console.log("Initializing MySQL DATABASE 🥕🥕🥕")

            return dataSource.initialize();
        }
    }
]
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QueryUserDto } from './dto/query-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const mockUserDatabase: User[] = [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      age: 30,
      email: "johndoe@mail.com",
      password: "*10*++*johndoe*++*testing*"
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'USER_REPOSITORY',
          useValue: {
            save: jest.fn((user: User) => {
              // This is for updating (where user has an id property)
              if (!!user.id) {
                const userIndex = mockUserDatabase.findIndex(mockUser => mockUser.id === user.id);
                mockUserDatabase.splice(userIndex, 1, user);

                return user;
              }

              const id = mockUserDatabase.length + 1;

              const savedUser = {
                ...user,
                id
              }

              mockUserDatabase.push(savedUser);

              return savedUser
            }),
            find: jest.fn(() => {
              return mockUserDatabase
            }),
            findBy: jest.fn((queryParams: QueryUserDto) => {
              const usersFilteredByQueryParams = mockUserDatabase.filter(mockUser => {
                const isUserPassed = Object.entries(queryParams).reduce(
                  (acc: boolean, [key, value]) => {
                    return acc && (mockUser[key] === value)
                  },
                  true
                );
      
                return isUserPassed;
              });
              return usersFilteredByQueryParams
            }),
            findOneBy: jest.fn(({id}: {id: number}) => {
              const foundUser = mockUserDatabase.find(mockUser => mockUser.id === id);

              return foundUser
            }),
            remove: jest.fn((user: User) => {
              const userIndex = mockUserDatabase.findIndex(mockUser => mockUser.id === user.id);

              mockUserDatabase.splice(userIndex, 1);
              
              return user;
            })
          }
        }
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>('USER_REPOSITORY')
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('CREATE', () => {
    it('should be DEFINED', () => {
      expect(usersService.create).toBeDefined();
    })

    it('should CALL the encoding function *bcrypt hash* to encode the plain password', async () => {
      const create_dto = {
        first_name: "Jane",
        last_name: "Doe",
        age: 25,
        email: "janedoe@mail.com",
        password: "janedoe"
      }

      jest.spyOn(bcrypt, 'hash').mockImplementation(async (data, salt) => {
        return `*${salt}*++*${data}*++*testing*`
      });

      await usersService.create(create_dto);

      expect(bcrypt.hash).toHaveBeenCalledWith("janedoe", 10);
    })

    it('should THROW a *Bad Request Error* if email already exists', async () => {
      const create_dto = {
        first_name: "Mary",
        last_name: "Sue",
        age: 20,
        email: "janedoe@mail.com",
        password: "marysue"
      }

      // Added an implementation where it checks the uniqueness of the email
      jest.spyOn(userRepository, 'save').mockImplementationOnce(async (user) => {
        try {
          const id = mockUserDatabase.length + 1;
          
          const isEmailAlreadyExists = mockUserDatabase.some(mockUser => mockUser.email === user.email);

          if (isEmailAlreadyExists) throw new BadRequestException('Email already exists')

          const savedUser = {
            ...user,
            id
          } as User

          mockUserDatabase.push(savedUser);

          return savedUser;
        } catch (error) {
          throw error
        }
      })

      expect(async () => {
        await usersService.create(create_dto)
      }).rejects.toThrow(BadRequestException)
    })

    it('should create a new User BY RETURNING the created new user data', async () => {
      const create_dto = {
        first_name: "Mary",
        last_name: "Sue",
        age: 20,
        email: "marysue@mail.com",
        password: "marysue"
      }

      const expectedResult = {
        ...create_dto,
        password: '*10*++*marysue*++*testing*',
        id: 3
      }

      expect(await usersService.create(create_dto)).toStrictEqual(expectedResult);
    })
  })

  describe('FIND ALL', () => {
    it('should be DEFINED', () => {
      expect(usersService.findAll).toBeDefined();
    })

    it('should GET all Users', async () => {
      expect(await usersService.findAll({})).toStrictEqual(mockUserDatabase)
    })

    it('should GET Users by *query params*', async () => {
      const queryParams = {
        first_name: "Jane",        
        last_name: "Doe",
      };

      /**
       * 
       *  So the expected result should return an array of data
       *  where:
       *    > First Name = `Jane`
       *    > Last Name = `Doe`
       * 
       *  based on the *queryParams*
       */
      const expectedResult = mockUserDatabase.filter(mockUser => {
        return mockUser.first_name === "Jane" && mockUser.last_name === "Doe"
      })

      expect(await usersService.findAll(queryParams)).toStrictEqual(expectedResult);
    })
  })

  describe('FIND ONE', () => {
    it('should be DEFINED', () => {
      expect(usersService.findOne).toBeDefined()
    })

    it('should CALL function *findOneBy* by TypeORM User Repository', async () => {
      const userId = 1;

      await usersService.findOne(userId);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    })

    it('should THROW a *Not Found Error* if User does NOT exists', async () => {
      /**
       * 
       *  This User ID does NOT exist yet in `mockUserDatabase`
       */
      const userId = 5;

      expect(async () => {
        await usersService.findOne(userId)
      }).rejects.toThrow(NotFoundException)
    })

    it('should GET User', async () => {
      const userId = 1;

      /**
       *  So the expected result should return the data of the User
       *  whose `id` is **1**.
       * 
       *  This user is `John Doe`
       */
      const expectedResult = mockUserDatabase.find(mockUser => mockUser.id === 1);

      expect(await usersService.findOne(userId)).toStrictEqual(expectedResult)
    })
  })

  describe('UPDATE', () => {
    jest.spyOn(bcrypt, 'hashSync').mockImplementation((data, salt) => {
      return `*${salt}*++*${data}*++*testing*`
    })

    it('should be DEFINED', () => {
      expect(usersService.update).toBeDefined()
    })

    it('should CALL function *findOneBy* by TypeORM User Repository', async () => {
      const userId = 1;
      const update_dto = {
        age: 31
      }

      await usersService.update(userId, update_dto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    })

    it('should CALL the encoding function *bcrypt hash* to encode the updated plain password', async () => {
      const userId = 1;
      const update_dto = {
        password: "doejohn"
      }

      await usersService.update(userId, update_dto);

      expect(bcrypt.hashSync).toHaveBeenCalledWith("doejohn", 10)
    })

    it('should THROW a *Not Found Error* if User is NOT found', async () => {
      /**
       * 
       * This User ID does NOT exist yet in `mockUserDatabase` 
       */
      const userId = 5;
      const update_dto = {
        last_name: "Philips"
      };

      expect(async () => {
        await usersService.update(userId, update_dto)
      }).rejects.toThrow(NotFoundException)
    })

    it('should update an existing User BY RETURNING the updated user data', async () => {
      const userId = 1;
      const update_dto = {
        age: 32
      }

      /**
       * 
       *  So the expected result is the data of the User with an `id` of **1**
       *  with the updated data:
       *  
       *  > Age = 32
       * 
       *  This user is `John Doe`
       * 
       */
      const expectedResult = {
        ...mockUserDatabase.find(mockUser => mockUser.id === userId)!,
        age: 32 
      }

      expect(await usersService.update(userId, update_dto)).toStrictEqual(expectedResult);
    })
  })

  describe('DELETE', () => {
    it('should be DEFINED', () => {
      expect(usersService.remove).toBeDefined()
    })

    it('should CALL function *findOneBy* by TypeORM User Repository', async () => {
      const userId = 3;

      await usersService.remove(userId);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    })

    it('should THROW a *Not Found Error* if User does NOT exists', async () => {
      /**
       * 
       *  This User ID does NOT exist yet in `mockUserDatabase`
       */
      const userId = 5;

      expect(async () => {
        await usersService.remove(userId)
      }).rejects.toThrow(NotFoundException)
    })

    it('should remove an existing User BY RETURNING the removed user data', async () => {
      const userId = 2;

      /**
       * 
       *  So this expected result is the data of the User with an `id` of **2**
       *  This user is `Jane Doe`
       *  
       *  `NOTE`: This user data was create in the CREATE Test
       * 
       */
      const expectedResult = mockUserDatabase.find(mockUser => mockUser.id === 2);

      expect(await usersService.remove(userId)).toStrictEqual(expectedResult);
    })
  })
});

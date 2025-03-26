import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './entities/user.entity';
import { QueryUserDto } from './dto/query-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';


describe('UsersController', () => {
  let usersController: UsersController;

  const mockUsersService = {
    findAll: jest.fn((queryUserDto: QueryUserDto) => [] as User[]),
    findOne: jest.fn((id: number) => ({}) as User),
    create: jest.fn((createUserDto: CreateUserDto) => ({}) as User),
    update: jest.fn((id: number, updateUserDto: UpdateUserDto) => ({}) as User),
    remove: jest.fn((id: number) => ({}) as User)
  }
  const mockUserProvider = {}
  const mockAuthGuard: CanActivate = {
    canActivate: jest.fn(() => true)
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      // Providers
      .overrideProvider(UsersService)
      .useValue(mockUsersService)

      .overrideProvider('USER_REPOSITORY')
      .useValue(mockUserProvider)

      // Guard
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('/findAll', () => {
    it('should GET ALL Users', async () => {
      const result: User[] = [];

      jest.spyOn(mockUsersService, 'findAll').mockImplementation(() => result);

      expect(await usersController.findAll({})).toBe(result);
    })

    it('should GET Users using Query Params', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          age: 25,
          first_name: "Jane",
          last_name: "Doe",
          email: "janedoe@mail.com",
          password: "janedoe"
        },
        {
          id: 2,
          age: 28,
          first_name: "Jason",
          last_name: "Ababat",
          email: "jasonababat@mail.com",
          password: "jasonababat"
        },
        {
          id: 3,
          age: 30,
          first_name: "John",
          last_name: "Doe",
          email: "johndoe@mail.com",
          password: "johndoe"
        }
      ];

      const queryParams: QueryUserDto = {
        last_name: "Doe",
        first_name: "Jane"
      }

      const expected_result = mockUsers.filter(mockUser => {
        return mockUser.first_name === queryParams.first_name && mockUser.last_name === queryParams.last_name
      })


      jest.spyOn(mockUsersService, 'findAll').mockImplementationOnce((queryUserDto: QueryUserDto) => {
        const usersFilteredByQueryParams = mockUsers.filter(mockUser => {
          const isUserPassed = Object.entries(queryUserDto).reduce(
            (acc: boolean, [key, value]) => {
              return acc && (mockUser[key] === value)
            },
            true
          );

          return isUserPassed;
        });
        return usersFilteredByQueryParams
      });

      expect(await usersController.findAll(queryParams)).toStrictEqual(expected_result);

    })
  })

  describe('/findOne', () => {
    it('should GET A Specific User using ID as param', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          age: 25,
          first_name: "Jane",
          last_name: "Doe",
          email: "janedoe@mail.com",
          password: "janedoe"
        },
        {
          id: 2,
          age: 28,
          first_name: "Jason",
          last_name: "Ababat",
          email: "jasonababat@mail.com",
          password: "jasonababat"
        },
        {
          id: 3,
          age: 30,
          first_name: "John",
          last_name: "Doe",
          email: "johndoe@mail.com",
          password: "johndoe"
        }
      ];

      const expected_result = mockUsers.find(mockUser => {
        return mockUser.id === 2;
      });

      jest.spyOn(mockUsersService, 'findOne').mockImplementation((id: number) => {
        const foundUser = mockUsers.find(mockUser => {
          return mockUser.id === id
        });

        return foundUser ?? ({} as User)
      })

      expect(await usersController.findOne("2")).toStrictEqual(expected_result);
    })
  })

  describe('/create', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        age: 25,
        first_name: "Jane",
        last_name: "Doe",
        email: "janedoe@mail.com",
        password: "janedoe"
      },
      {
        id: 2,
        age: 28,
        first_name: "Jason",
        last_name: "Ababat",
        email: "jasonababat@mail.com",
        password: "jasonababat"
      },
      {
        id: 3,
        age: 30,
        first_name: "John",
        last_name: "Doe",
        email: "johndoe@mail.com",
        password: "johndoe"
      }
    ];


    it("should CREATE a new User by returning the new User's Data", async () => {
      const generated_id = Math.floor((Math.random() * 100) + 1);
      const hashedPassword = 'sampleHashedPassword';

      const create_dto = {
        first_name: "Jack",
        last_name: "Marston",
        age: 25,
        email: "jackmarston@mail.com",
        password: "jackmarston"
      };

      const expected_result = {
        ...create_dto,
        password: hashedPassword,
        id: generated_id
      }

      jest.spyOn(mockUsersService, 'create').mockImplementation((createUserDto) => {
        return {
          ...createUserDto,
          id: generated_id,
          password: hashedPassword
        }
      })

      expect(await usersController.create(create_dto)).toStrictEqual(expected_result)
    })

    it("should THROW a Bad Request Error if email already exists", async () => {
      const generated_id = Math.floor((Math.random() * 100) + 1);
      const hashedPassword = 'sampleHashedPassword';

      const create_dto = {
        first_name: "Dan",
        last_name: "Smith",
        age: 26,
        email: "johndoe@mail.com",
        password: "dansmith"
      };

      jest.spyOn(mockUsersService, 'create').mockImplementationOnce((createUserDto) => {
        try {
          const isEmailAlreadyExists = mockUsers.some(mockUser => mockUser.email === createUserDto.email);

          if (isEmailAlreadyExists) throw new BadRequestException("Email already exists");

          return {
            ...createUserDto,
            id: generated_id,
            password: hashedPassword
          }
        } catch (error) {
          // return error.message
          throw error
        }
      });

      // expect(await usersController.create(create_dto)).toEqual('Email already exists');
      expect(async () => {
        await usersController.create(create_dto)
      }).rejects.toThrow(BadRequestException);
    })
  })

  describe('/update', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        age: 25,
        first_name: "Jane",
        last_name: "Doe",
        email: "janedoe@mail.com",
        password: "janedoe"
      },
      {
        id: 2,
        age: 28,
        first_name: "Jason",
        last_name: "Ababat",
        email: "jasonababat@mail.com",
        password: "jasonababat"
      },
      {
        id: 3,
        age: 30,
        first_name: "John",
        last_name: "Doe",
        email: "johndoe@mail.com",
        password: "johndoe"
      }
    ];

    it("should THROW a Not Found Error if User is not found", async () => {
      const update_dto = {
        first_name: "Billy"
      };
      
      /**
       * 
       *  This User does NOT exists
       * 
       */
      const user_id = "7";

      jest.spyOn(mockUsersService, 'update').mockImplementation((id, updateUserDto) => {
        const foundUser = mockUsers.find(mockUser => mockUser.id === id);

        if (!foundUser) throw new NotFoundException("User not found");

        return {
          ...foundUser,
          ...updateUserDto
        }
      });

      expect(async () => {await usersController.update(user_id, update_dto)}).rejects.toThrow(NotFoundException);
    });

    it("should UPDATE an existing User by returning the updated User's Data", async () => {
      const update_dto = {
        age: 31
      }

      const user_id = "3";

      const foundUser = mockUsers.find(mockUser => mockUser.id === +user_id);

      jest.spyOn(mockUsersService, 'update').mockImplementation((id, updateUserDto) => {
        const foundUser = mockUsers.find(mockUser => mockUser.id === id) ?? ({} as User);
        return {
          ...foundUser,
          ...updateUserDto
        }
      });

      expect(await usersController.update(user_id, update_dto)).toStrictEqual({
        ...foundUser,
        ...update_dto
      })
    })

  })

  describe('/delete', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        age: 25,
        first_name: "Jane",
        last_name: "Doe",
        email: "janedoe@mail.com",
        password: "janedoe"
      },
      {
        id: 2,
        age: 28,
        first_name: "Jason",
        last_name: "Ababat",
        email: "jasonababat@mail.com",
        password: "jasonababat"
      },
      {
        id: 3,
        age: 30,
        first_name: "John",
        last_name: "Doe",
        email: "johndoe@mail.com",
        password: "johndoe"
      }
    ];

    it("should THROW a Not Found Error if User is not found", async () => {
      /**
       * 
       *  This User does NOT exists
       * 
       */
      const user_id = "7";

      jest.spyOn(mockUsersService, 'remove').mockImplementation((id) => {
        const foundUser = mockUsers.find(mockUser => mockUser.id === id);

        if (!foundUser) throw new NotFoundException("User not found");

        const foundUserIndex = mockUsers.findIndex(mockUser => mockUser.id === id);

        mockUsers.splice(foundUserIndex, 1);

        return foundUser;
      });

      expect(async () => {await usersController.remove(user_id)}).rejects.toThrow(NotFoundException);
    });

    it("should DELETE an existing User by returning the deleted User's Data", async () => {
      const user_id = "2";

      const foundUser = mockUsers.find(mockUser => mockUser.id === +user_id);

      jest.spyOn(mockUsersService, 'remove').mockImplementation((id) => {
        const foundUserIndex = mockUsers.findIndex(mockUser => mockUser.id === id) ?? ({} as User);
        const foundUser = mockUsers.find(mockUser => mockUser.id === id) ?? ({} as User);

        mockUsers.splice(foundUserIndex, 1);

        console.log("🕌: ", {
          mockUsers,
          foundUser
        })

        return foundUser
      });

      expect(await usersController.remove(user_id)).toStrictEqual(foundUser);

    })

  })
});

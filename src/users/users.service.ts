import { 
  Injectable, 
  Inject, 
  NotFoundException,
  BadRequestException 
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hash, hashSync } from 'bcrypt';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor (
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hash(createUserDto.password, 10);
    
    const user = new User();
    user.first_name = createUserDto.first_name;
    user.last_name = createUserDto.last_name;
    user.age = createUserDto.age;
    user.email = createUserDto.email;
    user.password = hashedPassword;

    try {
      const result = await this.userRepository.save(user);
      console.log("🔥 Create result: ", result);

      return result;
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async findAll(queryUserDto: QueryUserDto) {
    if (!!Object.keys(queryUserDto).length) {
      const getByFilter = await this.userRepository.findBy(queryUserDto);

      return getByFilter
    }

    const getAll = await this.userRepository.find();

    console.log("💋 GET ALL: ", getAll)
    return getAll;
  }

  async findOne (id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User Not Found')

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('Update User Error', {
      description: 'User Not Found'
    })

    console.log("🚀 Fetched User: ", user);

    const updatedUser = Object.entries(updateUserDto).reduce(
      (acc, [column, value]) => {
        if (column === 'password') {
          const newHashedPassword = hashSync(value, 10);

          acc[column] = newHashedPassword;
          return acc;
        }

        acc[column] = value
        return acc;
      },
      user
    );

    try {
      const result = await this.userRepository.save(updatedUser);

      console.log("🏠 Update Result: ", result);

      return result;
    } catch (error) {
      throw new BadRequestException('Update User Error', {
        cause: error,
        description: error.message
      })
    }
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User Not Found')

    const result = await this.userRepository.remove(user);

    return result;
  }
}

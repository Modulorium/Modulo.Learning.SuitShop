import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../model/mysql.js';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async seedDatabase() {
        await this.userRepository.save({username: "gerbil", name: "Gerbil", email: "gerbil@gmail.com", role: UserRole.ADMIN })
        await this.userRepository.save({username: "garfield", name: "Garfield", email: "garfield@gmail.com", role: UserRole.USER })
        await this.userRepository.save({username: "gnome", name: "Gnome", email: "gnome@gmail.com", role: UserRole.USER })
        const users = await this.searchUsers({})
        return users.map((user) => user.id)
    }

    async searchUsers(user: Partial<User>) {
        return await this.userRepository.find({
            where: user
        });
    }

    async createUser(user: Partial<User>) {
        if (!user.username || !user.name || !user.email) {
            throw new BadRequestException('Request is missing some properties');
        }
        const exists = await this.userRepository.exists({
            where: {username: user.username}
        })
        if (exists) {
            throw new BadRequestException('This username is already taken');
        }
        return this.userRepository.save({
            username: user.username,
            name: user.name,
            email: user.email,
            role: UserRole.USER
        })
    }

    async getUser(id: string) {
        return await this.userRepository.findOne({
            where: {id: id},
            relations: { orders: true}
        });
    }

    async updateUser(id: string, user: Partial<User>) {
        const _user = await this.userRepository.findOneBy({ id });
        if (_user) {
            _user.username = user.username ?? _user.username
            _user.name = user.name ?? _user.name
            _user.email = user.email ?? _user.email
            return await this.userRepository.save(_user);
        }
        throw new BadRequestException('Operation failed');
    }

    async deleteUser(id: string) {
        return await this.userRepository.delete(id)
    }

}

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './user';

export const USERS: User[] = [
    {
        id: crypto.randomUUID(),
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: bcrypt.hashSync('password123', 10),
    },
    {
        id: crypto.randomUUID(),
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: bcrypt.hashSync('password123', 10),
    },
    {
        id: crypto.randomUUID(),
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        password: bcrypt.hashSync('password123', 10),
    },
    {
        id: crypto.randomUUID(),
        name: 'admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('admin', 10),
    },
];

@Injectable()
export class UserService {
    getAllUsers(): User[] {
        return USERS;
    }

    getUserByName(name: string): User | undefined {
        return USERS.find((user) => user.name === name);
    }
}

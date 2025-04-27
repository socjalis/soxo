import { UserService } from './user.service';

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
    });

    it('should return all users', () => {
        const users = userService.getAllUsers();

        expect(users).toHaveLength(4);
    });

    it('should return a user by name', () => {
        const user = userService.getUserByName('Jane Smith');

        expect(user).toBeDefined();
        expect(user?.email).toBe('jane.smith@example.com');
    });

    it('should return undefined for a non-existent user', () => {
        const user = userService.getUserByName('Non Existent');

        expect(user).toBeUndefined();
    });
});

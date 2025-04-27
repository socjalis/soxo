import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { USERS, UserService } from '../resources/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUser = USERS[0];

describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: {
                        getUserByName: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should return access token for valid credentials', async () => {
        const mockToken = 'mockAccessToken';
        jest.spyOn(bcrypt, 'compare');
        jest.spyOn(userService, 'getUserByName').mockReturnValue(mockUser);
        jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockToken);

        const result = await authService.signIn(mockUser.name, 'password123');

        expect(userService.getUserByName).toHaveBeenCalledWith(mockUser.name);
        expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
        expect(jwtService.signAsync).toHaveBeenCalledWith({ username: mockUser.name });
        expect(result).toEqual({ access_token: mockToken });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
        jest.spyOn(userService, 'getUserByName').mockReturnValue(undefined);

        await expect(authService.signIn('invaliduser', 'password')).rejects.toThrow(UnauthorizedException);
        expect(userService.getUserByName).toHaveBeenCalledWith('invaliduser');
    });

    it('should throw UnauthorizedException if password does not match', async () => {
        jest.spyOn(bcrypt, 'compare');
        jest.spyOn(userService, 'getUserByName').mockReturnValue(mockUser);

        await expect(authService.signIn('testuser', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
        expect(userService.getUserByName).toHaveBeenCalledWith('testuser');
        expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
    });
});

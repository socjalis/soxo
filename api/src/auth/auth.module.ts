import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { SECRET_KEY } from './auth.consts';
import { AuthController } from './auth.controller';
import { UserModule } from '../resources/user/user.module';

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
            secret: SECRET_KEY,
            signOptions: { expiresIn: '600s' },
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}

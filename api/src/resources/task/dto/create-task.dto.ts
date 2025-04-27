import { IsString, Length } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @Length(1, 50)
    title: string;

    @IsString()
    @Length(0, 200)
    description: string;
}

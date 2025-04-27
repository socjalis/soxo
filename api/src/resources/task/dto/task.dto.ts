import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TaskDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    createdAt: string;

    @Expose()
    updatedAt: string;
}

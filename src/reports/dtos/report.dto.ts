import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/user.entity';

export class ReportDto {
  @Expose()
  id: number;
  @Expose()
  approved: boolean;
  @Expose()
  price: number;
  @Expose()
  year: number;
  @Expose()
  lng: number;
  @Expose()
  lat: number;
  @Expose()
  make: string;
  @Expose()
  model: string;
  @Expose()
  milage: string;

  @Transform(({ obj }) => (obj && obj.user ? obj.user.id : null))
  @Expose()
  userId: number;
}

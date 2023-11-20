import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { UserDto } from 'src/users/dtos/user.dto';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

// Create Interface for DTO type check, so DTO argument has to be a class type
interface ClassContructor {
  new (...args: any[]): {};
}

// create custom Decorator
// Decorators are plain functions
export function Serialize(dto: ClassContructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {} // So our Interceptor accepts arguments, which is going to be chosen DTO

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // Run something before a request is handled
    // by the request handler

    return handler.handle().pipe(
      map((data: ClassContructor) => {
        // Run Something before the response is sent out

        // Turns Data which is an User entity instance (In this case) into the dto format (that is provided as an argument)
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true, //makes sure only fields that have decorator of @Exposed() in Dto, are shown
        });
      }),
    );
  }
}

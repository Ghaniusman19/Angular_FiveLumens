import { HttpInterceptorFn } from '@angular/common/http';

export const authKeyInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(req.url);
  return next(req);
};

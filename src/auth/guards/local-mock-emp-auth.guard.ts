import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LocalMockAuthGuard extends AuthGuard('local-mock-emp'){}
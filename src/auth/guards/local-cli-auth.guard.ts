import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LocalCliAuthGuard extends AuthGuard('local-cli'){}
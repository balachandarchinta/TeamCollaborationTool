declare module '@prisma/client' {
  export class PrismaClient {
    constructor();
    task: any;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
  }
}

import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// иногда для дебага включаю логи. надо настроить это по красивому (TODO)

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            // log: ['query'],
        });
    }

    public async onModuleInit() {
        await this.$connect();

        // // @ts-ignore
        // this.$on('query', (e) => {
        //     // @ts-ignore
        //     console.log('Params: ' + e.params)
        //     // @ts-ignore
        //     console.log('Duration: ' + e.duration + 'ms')
        // })
    }

    public async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }
}

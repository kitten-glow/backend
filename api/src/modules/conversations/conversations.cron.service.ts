import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class ConversationsCronService {
    constructor(private readonly prisma: PrismaService) {}

    private readonly logger = new Logger(ConversationsCronService.name);

    @Cron('* * * * *')
    public async cleanBannedUsers() {
        const { count } = await this.prisma.participantBan.deleteMany({
            where: {
                expireDate: {
                    lte: new Date(),
                },
            },
        });

        this.logger.log(`Разбан пользователей в чатах. Очищено ${count} объектов.`);
    }
}

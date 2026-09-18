import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb+srv://publicUser:lfenK47pOfrv6KlA@mycluster.mt6afrt.mongodb.net/petrodyn?retryWrites=true&w=majority&appName=mycluster',
        ),
        dbName: configService.get<string>('MONGODB_DB_NAME', 'petrodyn'),
      }),
      inject: [ConfigService],
    }),
    IngestionModule,
  ],
})
export class AppModule {}

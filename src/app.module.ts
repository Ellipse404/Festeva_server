import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VerificationModule } from './verification/verification.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl =
          process.env.DATABASE_URL ||
          process.env.INTERNAL_DATABASE_URL ||
          configService.get<string>('DATABASE_URL') ||
          configService.get<string>('INTERNAL_DATABASE_URL');

        if (dbUrl && dbUrl.trim()) {
          console.log(
            '✅ Connecting to PostgreSQL via DATABASE_URL Connection String',
          );
          return {
            type: 'postgres',
            url: dbUrl.trim(),
            autoLoadEntities: true,
            synchronize: true,
            ssl:
              dbUrl.includes('sslmode=') ||
              dbUrl.includes('render.com') ||
              dbUrl.includes('supabase') ||
              dbUrl.includes('neon.tech') ||
              process.env.NODE_ENV === 'production'
                ? { rejectUnauthorized: false }
                : false,
          };
        }

        const host =
          process.env.DB_HOST ||
          configService.get<string>('DB_HOST') ||
          'localhost';

        console.log(`✅ Connecting to PostgreSQL via Host: ${host}`);

        return {
          type: 'postgres',
          host,
          port: Number(
            process.env.DB_PORT || configService.get<number>('DB_PORT', 5432),
          ),
          username:
            process.env.DB_USER ||
            configService.get<string>('DB_USER', 'postgres'),
          password:
            process.env.DB_PASSWORD ||
            configService.get<string>('DB_PASSWORD', 'Password@3224'),
          database:
            process.env.DB_NAME ||
            configService.get<string>('DB_NAME', 'event_ticketing_db'),
          autoLoadEntities: true,
          synchronize: true,
          ssl:
            host.includes('render.com') || process.env.NODE_ENV === 'production'
              ? { rejectUnauthorized: false }
              : false,
        };
      },
    }),

    UsersModule,
    AuthModule,
    EventsModule,
    VerificationModule,
    PaymentsModule,
  ],
})
export class AppModule {}

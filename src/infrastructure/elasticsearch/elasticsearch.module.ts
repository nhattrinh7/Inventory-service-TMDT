import { Module, Global } from '@nestjs/common'
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch'
import { ConfigService } from '@nestjs/config'

@Global()
@Module({
  imports: [
    NestElasticsearchModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE', 'http://localhost:9200'),
        maxRetries: 3,
        requestTimeout: 60000,
        pingTimeout: 60000,
      }),
    }),
  ],
  exports: [NestElasticsearchModule],
})
export class ElasticsearchModule {}

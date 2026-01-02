import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, Param } from '@nestjs/common';
import { ExtractionService } from '../core/extraction.service';

@Controller('api/v1/extract')
export class ExtractController {
  constructor(private readonly extractionService: ExtractionService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async extract(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }
    
    const result = await this.extractionService.extract(url);
    return {
      success: true,
      data: result,
    };
  }

  @Post(':platform')
  @HttpCode(HttpStatus.OK)
  async extractPlatform(@Body('url') url: string, @Param('platform') platform: string) {
      if (!url) {
        throw new BadRequestException('URL is required');
      }

      // decode platform if needed, though usually clean
      const result = await this.extractionService.extract(url, platform);
      return {
          success: true,
          data: result
      }
  }
}

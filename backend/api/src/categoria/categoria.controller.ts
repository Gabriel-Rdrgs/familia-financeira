import { Controller, Get, Post } from '@nestjs/common';
import { CategoriaService } from './categoria.service';

@Controller('categorias')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  findAll() {
    return this.categoriaService.findAll();
  }

  // endpoint para rodar o seed manualmente
  @Post('seed')
  async seed() {
    await this.categoriaService.seedDefaults();
    return { message: 'Categorias padrão criadas (se ainda não existiam).' };
  }
}
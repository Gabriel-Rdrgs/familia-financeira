import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { PessoaService } from './pessoa.service';
import { Prisma } from '@prisma/client';

@Controller('pessoas')
export class PessoaController {
  constructor(private readonly pessoaService: PessoaService) {}

  @Get()
  findAll() {
    return this.pessoaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pessoaService.findOne(id);
  }

  @Post()
  create(@Body() data: Prisma.PessoaCreateInput) {
    return this.pessoaService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Prisma.PessoaUpdateInput,
  ) {
    return this.pessoaService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pessoaService.remove(id);
  }
}
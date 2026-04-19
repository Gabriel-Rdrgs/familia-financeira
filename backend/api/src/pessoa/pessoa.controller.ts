// backend/api/src/pessoa/pessoa.controller.ts
import {
  Body, Controller, Delete, Get, Param,
  ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { PessoaService } from './pessoa.service';

class CreatePessoaDto {
  nome: string;
  email?: string;
  papel?: string;
  cor?: string;
}

class UpdatePessoaDto {
  nome?: string;
  email?: string;
  papel?: string;
  cor?: string;
  ativo?: boolean;
}

@Controller('pessoas')
export class PessoaController {
  constructor(private readonly pessoaService: PessoaService) {}

  @Get()    findAll()                                              { return this.pessoaService.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number)      { return this.pessoaService.findOne(id); }
  @Post()   create(@Body() body: CreatePessoaDto)                 { return this.pessoaService.create(body); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdatePessoaDto) {
    return this.pessoaService.update(id, body);
  }
  @Delete(':id') delete(@Param('id', ParseIntPipe) id: number)    { return this.pessoaService.delete(id); }
}
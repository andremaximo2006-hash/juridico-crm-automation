/**
 * 🎨 API DE CONFIGURAÇÃO - Módulo Operacional
 * GET/PUT para customização visual
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// GET - Obter configuração atual
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Aqui você conectaria ao banco para buscar a configuração
    // Por enquanto, retorna a configuração padrão
    const config = {
      id: 'default',
      corPrevidenciario: '#3B82F6',
      corTrabalhista: '#10B981',
      corCivil: '#F59E0B',
      corFamilia: '#EC4899',
      corTributario: '#8B5CF6',
      corNovoColuna: '#6B7280',
      corTriagemColuna: '#3B82F6',
      corAndamentoColuna: '#F59E0B',
      corConcluidoColuna: '#10B981',
      labelNovo: 'Novo',
      labelTriagem: 'Triagem',
      labelAndamento: 'Andamento',
      labelConcluido: 'Concluído',
      corBaixa: '#10B981',
      corNormal: '#3B82F6',
      corAlta: '#F59E0B',
      corUrgente: '#EF4444',
      tema: 'light',
      tamanhoCard: 'medium',
      mostrarAvatar: true,
      mostrarProcesso: true,
      mostrarDPP: true,
      mostrarAlertas: true,
      mostrarObservacoes: true,
      colunaNovoVisivel: true,
      colunaTriagemVisivel: true,
      colunaAndamentoVisivel: true,
      colunaConcluidoVisivel: true,
      registrosPorPagina: 50,
      autoRefreshStats: 30,
      mostrarStatsPorColuna: true,
      requererMotivoMovimento: false,
      bloqueioAutomatico: true,
      notificacoes: true,
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configuração
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validações básicas
    const requiredFields = ['tema', 'tamanhoCard'];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Campo obrigatório faltando: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validar valores de tema
    if (!['light', 'dark', 'auto'].includes(body.tema)) {
      return NextResponse.json(
        { error: 'Tema inválido' },
        { status: 400 }
      );
    }

    // Validar tamanho de card
    if (!['small', 'medium', 'large'].includes(body.tamanhoCard)) {
      return NextResponse.json(
        { error: 'Tamanho de card inválido' },
        { status: 400 }
      );
    }

    // Validar cores hex
    const coresHex = [
      'corPrevidenciario', 'corTrabalhista', 'corCivil', 'corFamilia', 'corTributario',
      'corNovoColuna', 'corTriagemColuna', 'corAndamentoColuna', 'corConcluidoColuna',
      'corBaixa', 'corNormal', 'corAlta', 'corUrgente',
    ];

    for (const cor of coresHex) {
      if (body[cor] && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(body[cor])) {
        return NextResponse.json(
          { error: `Cor inválida: ${cor}` },
          { status: 400 }
        );
      }
    }

    // Aqui você salvar para o banco de dados
    // const updated = await prisma.configuradorOperacional.upsert({...});

    return NextResponse.json({
      message: 'Configuração atualizada com sucesso',
      data: body,
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

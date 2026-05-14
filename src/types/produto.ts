export type UUID = string;

export interface Produto {
  id: UUID;
  nome: string;
  tamanho?: string | null;
  descricao: string | null;
  estoque?: number | null;
  categoriaId?: string | null;
  destaque?: boolean | null;
  preco: number;
  imagemUrl: string | null;
  avaliacao?: number | null;
  criadoEm?: string | null;
}

export type ListarProdutosResponse = Produto[];
export type DetalharProdutoResponse = Produto;
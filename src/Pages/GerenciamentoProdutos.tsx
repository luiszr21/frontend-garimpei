import { useEffect, useState } from "react";
import { api } from "../Services/Api";
import { AdminLayout } from "../components/AdminLayout";
import type { Produto } from "../types/produto";

interface FormProduto extends Omit<Produto, "id"> {
  id?: string;
}

  const produtoVazio: FormProduto = {
  nome: "",
  descricao: "",
  preco: 0,
  tamanho: "",
  estoque: 1,
  categoriaId: "",
    destaque: false,
  imagemUrl: "",
};

export default function GerenciamentoProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormProduto>(produtoVazio);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Buscar produtos
  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const res = await api.get<Produto[]>("/produtos");
      setProdutos(res.data);
    } catch {
      setError("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Lidar com mudanças no formulário
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    let nextValue: string | number | boolean = value;

    if (type === "number") {
      nextValue = value === "" ? "" : parseFloat(value);
    }

    if (type === "checkbox") {
      nextValue = checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSucesso(null);

    try {
      // Validação mínima
      if (!editingId && (formData.estoque === undefined || Number(formData.estoque) <= 0)) {
        setError("Estoque deve ser maior que zero para o produto aparecer na listagem pública.");
        return;
      }
      if (editingId) {
        // Atualizar produto
        await api.put(`/admin/produtos/${editingId}`, formData);
        setSucesso("Produto atualizado com sucesso!");
      } else {
        // Criar novo produto
        await api.post("/admin/produtos", formData);
        setSucesso("Produto criado com sucesso!");
      }

      // Recarregar e notificar outras telas
      await carregarProdutos();
      window.dispatchEvent(new CustomEvent("produtos:updated"));
      setFormData(produtoVazio);
      setEditingId(null);
      setShowForm(false);
    } catch {
      setError(
        editingId
          ? "Erro ao atualizar produto"
          : "Erro ao criar produto"
      );
    }
  };

  // Editar produto
  const handleEditar = (produto: Produto) => {
    setFormData(produto);
    setEditingId(produto.id);
    setShowForm(true);
  };

  // Deletar produto
  const handleDeletar = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
      setError(null);
      await api.delete(`/admin/produtos/${id}`);
      setSucesso("Produto deletado com sucesso!");
      // Atualizar lista localmente e notificar
      setProdutos((atual) => atual.filter((p) => p.id !== id));
      window.dispatchEvent(new CustomEvent("produtos:updated"));
    } catch {
      setError("Erro ao deletar produto");
    }
  };

  // Cancelar edição
  const handleCancelar = () => {
    setFormData(produtoVazio);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96 text-lg text-gray-600">
          Carregando produtos...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Gerenciamento de Produtos
            </h1>
            <p className="text-gray-600">
              Cadastre, edite ou delete produtos do sistema
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-500 hover:bg-green-600 text-white font-semibold rounded-lg whitespace-nowrap transition-colors"
            >
               Novo Produto
            </button>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        {sucesso && (
          <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
            {sucesso}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingId ? "Editar Produto" : "Novo Produto"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o nome do produto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    id="preco"
                    name="preco"
                    value={formData.preco}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label htmlFor="tamanho" className="block text-sm font-medium text-gray-700 mb-2">
                    Tamanho
                  </label>
                  <input
                    type="text"
                    id="tamanho"
                    name="tamanho"
                    value={formData.tamanho || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: P, M, G"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="estoque" className="block text-sm font-medium text-gray-700 mb-2">
                    Estoque
                  </label>
                  <input
                    type="number"
                    id="estoque"
                    name="estoque"
                    value={formData.estoque ?? 1}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria (opcional)
                  </label>
                  <input
                    type="text"
                    id="categoriaId"
                    name="categoriaId"
                    value={formData.categoriaId || ""}
                    onChange={handleInputChange}
                    placeholder="ID da categoria"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao || ""}
                  onChange={handleInputChange}
                  placeholder="Descrição do produto..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label htmlFor="imagemUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  id="imagemUrl"
                  name="imagemUrl"
                  value={formData.imagemUrl || ""}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {editingId ? "Atualizar" : "Criar"} Produto
                </button>
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
              
        {/* Destaque toggle (aparece mesmo quando não editando) */}
        {showForm && (
          <div className="mb-8 ">
            <label className="flex items-center gap-1  font-medium">
              <input
                type="checkbox"
                name="destaque"
                checked={!!formData.destaque}
                onChange={handleInputChange}
              />
              <span>Mostrar como destaque</span>
            </label>
          </div>
        )}
            </form>
          </div>
        )}

       

        {/* Products Grid */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-500">
                Nenhum produto cadastrado
              </div>
            ) : (
              produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-500 transition-all hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {produto.imagemUrl ? (
                      <img
                        src={produto.imagemUrl}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-5xl">📦</div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {produto.nome}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                      {produto.descricao || "Sem descrição"}
                    </p>

                    {/* Price and Size */}
                    <div className="flex justify-between items-center mb-3 pt-3 border-t border-gray-200">
                      <span className="text-lg font-bold text-green-600">
                        R$ {produto.preco.toFixed(2)}
                      </span>
                      {produto.tamanho && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {produto.tamanho}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(produto)}
                        className="flex-1 px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded transition-colors"
                        title="Editar"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(produto.id)}
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded transition-colors"
                        title="Deletar"
                      >
                        🗑️ Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useNavigate } from "react-router-dom";
import type { Produto } from "../types";

function formatarPreco(valor: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(valor);
}

interface CardProdutoProps {
	produto: Produto;
	detalhe?: string;
}

export default function CardProduto({
	produto,
	detalhe,
}: CardProdutoProps) {
	const navigate = useNavigate();

	const handleVerDetalhes = () => {
		navigate(`/produto/${produto.id}`);
	};

	return (
		<article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
			<div className="relative aspect-4/3 overflow-hidden bg-slate-100">
				{produto.imagemUrl ? (
					<img
						src={produto.imagemUrl}
						alt={produto.nome}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full items-center justify-center px-6 text-center text-slate-600">
						<div>
							<p className="text-sm font-semibold">Imagem indisponível</p>
						</div>
					</div>
				)}
			</div>

			<div className="space-y-2 px-4 py-4">
				<h3 className="text-2xl font-extrabold leading-tight text-slate-900">
					{produto.nome}
				</h3>
				<p className="text-base font-bold text-slate-900">
					Preço: {formatarPreco(produto.preco)}
				</p>
				<p className="text-sm text-slate-600">
					{detalhe ?? produto.descricao ?? "Coleção atual"}
				</p>
				<button
					type="button"
					onClick={handleVerDetalhes}
					className="mt-2 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-500"
				>
					Ver detalhes
					<span aria-hidden="true">→</span>
				</button>
			</div>
		</article>
	);
}

'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Plus, Pencil, Trash2, X, Loader2, Package, Search } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Props {
  initialProducts: Product[];
  categories: { id: string; name: string; slug: string }[];
}

const EMPTY_FORM = {
  name: '', description: '', short_description: '', price: '', compare_price: '',
  stock: '', sku: '', category_id: '', images: '', featured: false, active: true,
};

export function AdminProductsClient({ initialProducts, categories }: Props) {
  const [products, setProducts]   = useState<Product[]>(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Product | null>(null);
  const [form, setForm]           = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [deleting, setDeleting]   = useState<string | null>(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name:              p.name,
      description:       p.description,
      short_description: p.short_description || '',
      price:             String(p.price),
      compare_price:     p.compare_price ? String(p.compare_price) : '',
      stock:             String(p.stock),
      sku:               p.sku || '',
      category_id:       p.category_id || '',
      images:            (p.images || []).join(', '),
      featured:          p.featured,
      active:            p.active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name:              form.name,
        description:       form.description,
        short_description: form.short_description || null,
        price:             parseFloat(form.price),
        compare_price:     form.compare_price ? parseFloat(form.compare_price) : null,
        stock:             parseInt(form.stock),
        sku:               form.sku || null,
        category_id:       form.category_id || null,
        images:            form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        featured:          form.featured,
        active:            form.active,
      };

      const url    = editing ? `/api/products/${editing.id}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';

      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro');

      if (editing) {
        setProducts(ps => ps.map(p => p.id === editing.id ? { ...p, ...json.data } : p));
        toast.success('Produto atualizado!');
      } else {
        setProducts(ps => [json.data, ...ps]);
        toast.success('Produto criado!');
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      setProducts(ps => ps.filter(p => p.id !== id));
      toast.success('Produto excluído!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const Field = ({ name, label, type = 'text', required = false, rows }: {
    name: keyof typeof EMPTY_FORM; label: string; type?: string; required?: boolean; rows?: number;
  }) => (
    <div>
      <label className="label">{label}{required && ' *'}</label>
      {rows ? (
        <textarea
          value={form[name] as string}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          required={required} rows={rows}
          className="input resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[name] as string}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          required={required}
          className="input"
          step={type === 'number' ? 'any' : undefined}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-800 text-2xl text-white">Produtos</h1>
          <p className="text-dark-400 text-sm mt-1">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 text-dark-500 text-xs font-mono uppercase tracking-wider">
                <th className="text-left px-4 py-3">Produto</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Categoria</th>
                <th className="text-right px-4 py-3">Preço</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Estoque</th>
                <th className="text-center px-4 py-3 hidden lg:table-cell">Status</th>
                <th className="text-right px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-dark-800 hover:bg-dark-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-dark-700 overflow-hidden relative shrink-0">
                        <Image
                          src={p.images?.[0] || `https://via.placeholder.com/40x40/1a1a2e/ea580c?text=${encodeURIComponent(p.name[0])}`}
                          alt={p.name} fill className="object-cover" sizes="40px"
                        />
                      </div>
                      <div>
                        <div className="font-display font-600 text-white text-sm line-clamp-1">{p.name}</div>
                        {p.sku && <div className="text-xs text-dark-500 font-mono">{p.sku}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-400 hidden md:table-cell">
                    {(p as any).category?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-display font-700 text-white">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className={`font-mono text-sm ${p.stock === 0 ? 'text-red-400' : p.stock <= 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-1.5">
                      {p.active ? (
                        <span className="badge bg-green-400/10 text-green-400">Ativo</span>
                      ) : (
                        <span className="badge bg-dark-600 text-dark-400">Inativo</span>
                      )}
                      {p.featured && <span className="badge bg-brand-600/20 text-brand-400">Destaque</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Excluir"
                      >
                        {deleting === p.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Package className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-500">Nenhum produto encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-display font-700 text-white text-lg">
                {editing ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field name="name" label="Nome" required />
                </div>
                <Field name="price"         label="Preço (R$)"       type="number" required />
                <Field name="compare_price" label="Preço original (R$)" type="number" />
                <Field name="stock"         label="Estoque"           type="number" required />
                <Field name="sku"           label="SKU" />
                <div className="sm:col-span-2">
                  <label className="label">Categoria</label>
                  <select
                    value={form.category_id}
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="input"
                  >
                    <option value="">Sem categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Field name="short_description" label="Descrição curta" rows={2} />
                </div>
                <div className="sm:col-span-2">
                  <Field name="description" label="Descrição completa" required rows={4} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">URLs das imagens (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={form.images}
                    onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                    placeholder="https://exemplo.com/img1.jpg, https://exemplo.com/img2.jpg"
                    className="input"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <span className="text-sm text-dark-300">Ativo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <span className="text-sm text-dark-300">Destaque</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : editing ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

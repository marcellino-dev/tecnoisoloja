'use client';

import { useState, useRef } from 'react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  Plus, Pencil, Trash2, X, Loader2, Package,
  Search, Upload, ImagePlus, Video, Star, GripVertical
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Props {
  initialProducts: Product[];
  categories: { id: string; name: string; slug: string }[];
}

const EMPTY_FORM = {
  name: '', description: '', short_description: '', price: '', compare_price: '',
  stock: '', sku: '', category_id: '', featured: false, active: true,
};

type MediaItem = { url: string; type: 'image' | 'video'; uploading?: boolean };

const isValidImage = (url: string) =>
  url?.includes('supabase.co') || url?.startsWith('/');

export function AdminProductsClient({ initialProducts, categories }: Props) {
  const [products, setProducts]   = useState<Product[]>(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Product | null>(null);
  const [form, setForm]           = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [media, setMedia]         = useState<MediaItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [deleting, setDeleting]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setMedia([]);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description,
      short_description: p.short_description || '',
      price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : '',
      stock: String(p.stock), sku: p.sku || '',
      category_id: p.category_id || '',
      featured: p.featured, active: p.active,
    });
    setMedia((p.images || []).map(url => ({
      url,
      type: url.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image',
    })));
    setShowModal(true);
  };

  const handleFiles = async (files: FileList) => {
    const allowed = Array.from(files).slice(0, 5 - media.length);
    if (allowed.length === 0) {
      toast.error('Máximo de 5 mídias por produto');
      return;
    }

    for (const file of allowed) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isImage && !isVideo) { toast.error(`${file.name}: tipo não suportado`); continue; }

      const tempUrl = URL.createObjectURL(file);
      const tempItem: MediaItem = { url: tempUrl, type: isVideo ? 'video' : 'image', uploading: true };
      setMedia(m => [...m, tempItem]);

      try {
        const fd = new FormData();
        fd.append('file', file);
        const res  = await fetch('/api/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setMedia(m => m.map(item =>
          item.url === tempUrl ? { url: json.url, type: isVideo ? 'video' : 'image', uploading: false } : item
        ));
      } catch (err: any) {
        setMedia(m => m.filter(item => item.url !== tempUrl));
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }
  };

  const removeMedia = (url: string) => setMedia(m => m.filter(i => i.url !== url));

  const setMainImage = (url: string) => {
    setMedia(m => [m.find(i => i.url === url)!, ...m.filter(i => i.url !== url)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (media.some(m => m.uploading)) { toast.error('Aguarde o upload terminar'); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name, description: form.description,
        short_description: form.short_description || null,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock: parseInt(form.stock), sku: form.sku || null,
        category_id: form.category_id || null,
        images: media.map(m => m.url),
        featured: form.featured, active: form.active,
      };
      const url    = editing ? `/api/products/${editing.id}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json   = await res.json();
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-800 text-2xl text-gray-900">Produtos</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} produto{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-600 text-sm rounded-xl transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Buscar produtos..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs font-600 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Produto</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Categoria</th>
                <th className="text-right px-6 py-3">Preço</th>
                <th className="text-right px-6 py-3 hidden sm:table-cell">Estoque</th>
                <th className="text-center px-6 py-3 hidden lg:table-cell">Status</th>
                <th className="text-right px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden relative shrink-0 border border-gray-200">
                        {p.images?.[0] && isValidImage(p.images[0]) ? (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-600 text-gray-900 text-sm line-clamp-1">{p.name}</div>
                        {p.sku && <div className="text-xs text-gray-400 font-mono">{p.sku}</div>}
                        <div className="text-xs text-gray-400">{(p.images || []).length} mídia{(p.images || []).length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                    {(p as any).category?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-700 text-gray-900">{formatPrice(p.price)}</div>
                    {p.compare_price && (
                      <div className="text-xs text-gray-400 line-through">{formatPrice(p.compare_price)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right hidden sm:table-cell">
                    <span className={`font-mono text-sm font-700 ${p.stock === 0 ? 'text-red-500' : p.stock <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-1.5">
                      {p.active
                        ? <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-600 rounded-full">Ativo</span>
                        : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-600 rounded-full">Inativo</span>}
                      {p.featured && <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-600 rounded-full">Destaque</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Excluir">
                        {deleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhum produto encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl animate-scale-in">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="font-display font-700 text-gray-900 text-lg">
                  {editing ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Preencha as informações do produto</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">

                {/* ── MÍDIA ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-600 text-gray-900 text-sm">Fotos e Vídeos</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Adicione até 5 mídias. A primeira será a imagem principal.</p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{media.length}/5</span>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    {/* Slots de mídia */}
                    {media.map((item, i) => (
                      <div key={item.url} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-brand-500' : 'border-gray-200'} bg-gray-50 group`}>
                        {item.type === 'video' ? (
                          <video src={item.url} className="w-full h-full object-cover" />
                        ) : isValidImage(item.url) ? (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-300" />
                          </div>
                        )}

                        {/* Uploading overlay */}
                        {item.uploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                          </div>
                        )}

                        {/* Actions overlay */}
                        {!item.uploading && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {i !== 0 && (
                              <button type="button" onClick={() => setMainImage(item.url)}
                                className="p-1.5 bg-white rounded-lg text-yellow-500 hover:bg-yellow-50 transition-colors" title="Definir como principal">
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button type="button" onClick={() => removeMedia(item.url)}
                              className="p-1.5 bg-white rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Remover">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Principal badge */}
                        {i === 0 && (
                          <div className="absolute bottom-1 left-1 right-1 bg-brand-600 text-white text-[9px] font-700 text-center rounded py-0.5">
                            PRINCIPAL
                          </div>
                        )}

                        {/* Tipo badge */}
                        {item.type === 'video' && (
                          <div className="absolute top-1 right-1 bg-black/60 text-white text-[9px] font-700 rounded px-1 py-0.5 flex items-center gap-0.5">
                            <Video className="w-2.5 h-2.5" /> VID
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Botão de adicionar */}
                    {media.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-400 hover:bg-brand-50 flex flex-col items-center justify-center gap-1 transition-all group"
                      >
                        <ImagePlus className="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                        <span className="text-[10px] text-gray-400 group-hover:text-brand-500 font-500">Adicionar</span>
                      </button>
                    )}

                    {/* Slots vazios */}
                    {Array.from({ length: Math.max(0, 4 - media.length) }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-gray-100 bg-gray-50" />
                    ))}
                  </div>

                  {/* Zona de drop */}
                  <div
                    className="mt-3 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-brand-400 hover:bg-brand-50 transition-all cursor-pointer"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                  >
                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">
                      <span className="text-brand-600 font-600">Clique para selecionar</span> ou arraste arquivos aqui
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WebP, MP4 até 50MB</p>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={e => e.target.files && handleFiles(e.target.files)}
                  />
                </div>

                {/* ── INFORMAÇÕES BÁSICAS ── */}
                <div>
                  <h3 className="font-600 text-gray-900 text-sm mb-3">Informações do Produto</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-600 text-gray-600 mb-1.5">Nome do produto *</label>
                      <input type="text" value={form.name} required
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Ex: Termômetro Digital Industrial TI-500"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all" />
                    </div>

                    <div>
                      <label className="block text-xs font-600 text-gray-600 mb-1.5">Preço de venda (R$) *</label>
                      <input type="number" step="0.01" min="0" value={form.price} required
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="0,00"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all" />
                    </div>

                    <div>
                      <label className="block text-xs font-600 text-gray-600 mb-1.5">Preço original (R$) <span className="text-gray-400 font-400">para desconto</span></label>
                      <input type="number" step="0.01" min="0" value={form.compare_price}
                        onChange={e => setForm(f => ({ ...f, compare_price: e.target.value }))}
                        placeholder="0,00"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all" />
                    </div>

                    <div>
                      <label className="block text-xs font-600 text-gray-600 mb-1.5">Estoque *</label>
                      <input type="number" min="0" value={form.stock} required
                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                        placeholder="0"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all" />
                    </div>

                    <div>
                      <label className="block text-xs font-600 text-gray-600 mb-1.5">SKU <span className="text-gray-400 font-400">código interno</span></label>
                      <input type="text" value={form.sku}
                        onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                        placeholder="Ex: TI-500"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-600 text-gray-600 mb-1.5">Categoria</label>
                      <select value={form.category_id}
                        onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-brand-400 transition-all">
                        <option value="">Selecione uma categoria</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── DESCRIÇÃO ── */}
                <div>
                  <h3 className="font-600 text-gray-900 text-sm mb-3">Descrição</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-600 text-gray-600 mb-1.5">Descrição curta <span className="text-gray-400 font-400">aparece nos cards</span></label>
                      <textarea value={form.short_description} rows={2}
                        onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                        placeholder="Resumo em 1-2 linhas do produto..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-600 text-gray-600 mb-1.5">Descrição completa *</label>
                      <textarea value={form.description} rows={5} required
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Descreva o produto em detalhes: especificações, características, diferenciais..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all resize-none" />
                    </div>
                  </div>
                </div>

                {/* ── CONFIGURAÇÕES ── */}
                <div>
                  <h3 className="font-600 text-gray-900 text-sm mb-3">Configurações</h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input type="checkbox" checked={form.active}
                        onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                        className="w-4 h-4 accent-brand-600" />
                      <div>
                        <p className="text-sm font-600 text-gray-800">Produto ativo</p>
                        <p className="text-xs text-gray-400">Visível na loja</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input type="checkbox" checked={form.featured}
                        onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                        className="w-4 h-4 accent-brand-600" />
                      <div>
                        <p className="text-sm font-600 text-gray-800">Produto em destaque</p>
                        <p className="text-xs text-gray-400">Aparece na homepage</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-100 px-6 py-4 flex gap-3 bg-gray-50 rounded-b-2xl">
                <button type="submit" disabled={loading || media.some(m => m.uploading)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white font-600 text-sm rounded-xl transition-all disabled:opacity-50 shadow-sm">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                    : editing ? 'Salvar Alterações' : 'Publicar Produto'
                  }
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 font-600 text-sm rounded-xl border border-gray-200 transition-all">
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

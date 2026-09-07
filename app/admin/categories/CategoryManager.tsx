'use client'

import { useState } from 'react'
import {
  DndContext, DragOverlay, closestCenter,
  PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { GripVertical, Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import type { Category, Product } from '@/lib/types'

type Props = { initialCategories: Category[]; initialProducts: Product[] }

function ProductCard({ product, isDragging }: { product: Product; isDragging?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-[14px]"
      style={{
        background: isDragging ? '#FFF0E5' : '#F8F8F5',
        border: isDragging ? '1.5px dashed #F5A623' : '1.5px solid transparent',
        opacity: isDragging ? 0.9 : 1,
        cursor: 'grab',
      }}
    >
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center" style={{ background: 'rgba(245,166,35,0.1)' }}>
          <span style={{ fontSize: 18 }}>🍊</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color: '#17182D' }}>{product.name}</p>
        <p className="text-[12px]" style={{ color: '#F5A623' }}>{product.price.toLocaleString()}원</p>
      </div>
      <GripVertical size={14} style={{ color: 'rgba(23,24,45,0.2)', flexShrink: 0 }} />
    </div>
  )
}

function DraggableProduct({ product }: { product: Product }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: product.id })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ opacity: isDragging ? 0.3 : 1 }}>
      <ProductCard product={product} />
    </div>
  )
}

function DroppableCategory({
  category, products, onEdit, onDelete,
}: {
  category: Category & { isEdit?: boolean };
  products: Product[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: category.id })
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(category.name)

  async function saveEdit() {
    if (!editName.trim() || editName === category.name) { setEditing(false); return }
    await fetch(`/api/categories/${category.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    onEdit(category.id, editName.trim())
    setEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      className="rounded-[20px] flex flex-col"
      style={{
        background: isOver ? '#FFF0E5' : '#FFFFFF',
        boxShadow: isOver ? '0 0 0 2px #F5A623' : '0 2px 12px rgba(23,24,45,0.06)',
        minHeight: 200,
        transition: 'all 0.15s',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderBottom: '1px solid rgba(23,24,45,0.06)' }}>
        {editing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
            className="flex-1 text-[14px] font-bold px-2 py-1 focus:outline-none rounded-lg"
            style={{ border: '1px solid rgba(23,24,45,0.2)', color: '#17182D' }}
          />
        ) : (
          <span className="flex-1 text-[14px] font-bold" style={{ color: '#17182D' }}>{category.name}</span>
        )}
        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(23,24,45,0.06)', color: 'rgba(23,24,45,0.4)' }}>
          {products.length}개
        </span>
        <div className="flex gap-1.5">
          {editing ? (
            <>
              <button onClick={saveEdit}><Check size={14} style={{ color: '#15803d' }} /></button>
              <button onClick={() => setEditing(false)}><X size={14} style={{ color: 'rgba(23,24,45,0.4)' }} /></button>
            </>
          ) : (
            <>
              <button onClick={() => { setEditing(true); setEditName(category.name) }}>
                <Pencil size={13} style={{ color: '#F5A623' }} />
              </button>
              <button onClick={() => onDelete(category.id)}>
                <Trash2 size={13} style={{ color: '#ef4444' }} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {products.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-[12px]" style={{ color: 'rgba(23,24,45,0.3)', minHeight: 80 }}>
            여기로 상품을 드래그하세요
          </div>
        )}
        {products.map((p) => <DraggableProduct key={p.id} product={p} />)}
      </div>
    </div>
  )
}

function UnassignedDroppable({ products }: { products: Product[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: '__unassigned__' })

  return (
    <div
      ref={setNodeRef}
      className="rounded-[20px]"
      style={{
        background: isOver ? '#DCEBFF' : '#FFFFFF',
        boxShadow: isOver ? '0 0 0 2px #1d4ed8' : '0 2px 12px rgba(23,24,45,0.06)',
        transition: 'all 0.15s',
      }}
    >
      <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderBottom: '1px solid rgba(23,24,45,0.06)' }}>
        <span className="flex-1 text-[14px] font-bold" style={{ color: '#17182D' }}>미배정 상품</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(23,24,45,0.06)', color: 'rgba(23,24,45,0.4)' }}>
          {products.length}개
        </span>
      </div>
      <div className="p-3 flex flex-col gap-2" style={{ minHeight: 120 }}>
        {products.length === 0 ? (
          <p className="text-center text-[12px] py-6" style={{ color: 'rgba(23,24,45,0.3)' }}>모든 상품이 카테고리에 배정됨</p>
        ) : (
          products.map((p) => <DraggableProduct key={p.id} product={p} />)
        )}
      </div>
    </div>
  )
}

export default function CategoryManager({ initialCategories, initialProducts }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [products, setProducts] = useState(initialProducts)
  const [newName, setNewName] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function getProductsByCategory(catId: string | null) {
    return products.filter((p) => (catId === null ? !p.category_id : p.category_id === catId))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setAddLoading(true)
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), sort_order: categories.length }),
    })
    if (res.ok) {
      const created = await res.json()
      setCategories((prev) => [...prev, created])
      setNewName('')
    }
    setAddLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('카테고리를 삭제하면 해당 상품들의 카테고리가 해제됩니다. 계속할까요?')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setProducts((prev) => prev.map((p) => p.category_id === id ? { ...p, category_id: null } : p))
    }
  }

  function handleEditCategory(id: string, name: string) {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name } : c))
  }

  function onDragStart(event: DragStartEvent) {
    const product = products.find((p) => p.id === event.active.id)
    setActiveProduct(product ?? null)
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveProduct(null)
    const { active, over } = event
    if (!over) return

    const productId = active.id as string
    const targetCatId = over.id === '__unassigned__' ? null : over.id as string

    const product = products.find((p) => p.id === productId)
    if (!product || product.category_id === targetCatId) return

    // Optimistic update
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, category_id: targetCatId } : p))

    await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: targetCatId }),
    })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {/* Add category */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-sm">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="새 카테고리 이름 (예: 포도류)"
          className="flex-1 px-4 py-2.5 text-[14px] focus:outline-none"
          style={{ border: '1px solid rgba(23,24,45,0.15)', borderRadius: 12, color: '#17182D', background: '#FFFFFF' }}
        />
        <button
          type="submit"
          disabled={addLoading || !newName.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-white rounded-xl disabled:opacity-50"
          style={{ background: '#F5A623' }}
        >
          <Plus size={14} /> 추가
        </button>
      </form>

      {/* Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <UnassignedDroppable products={getProductsByCategory(null)} />
        {categories.map((cat) => (
          <DroppableCategory
            key={cat.id}
            category={cat}
            products={getProductsByCategory(cat.id)}
            onEdit={handleEditCategory}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProduct && <ProductCard product={activeProduct} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}

export type ProductCategory =
  | 'dairy'
  | 'meat'
  | 'vegetables'
  | 'fruits'
  | 'frozen'
  | 'bread'
  | 'drinks'
  | 'other'

export interface CategoryOption {
  value: ProductCategory
  label: string
}

export const PRODUCT_CATEGORIES: CategoryOption[] = [
  {value: 'dairy', label: 'Nabiał'},
  {value: 'meat', label: 'Mięso'},
  {value: 'vegetables', label: 'Warzywa'},
  {value: 'fruits', label: 'Owoce'},
  {value: 'frozen', label: 'Mrożonki'},
  {value: 'bread', label: 'Pieczywo'},
  {value: 'drinks', label: 'Napoje'},
  {value: 'other', label: 'Inne'},
]

export const CATEGORY_LABELS: Record<ProductCategory, string> = PRODUCT_CATEGORIES.reduce(
  (acc, c) => ({...acc, [c.value]: c.label}),
  {} as Record<ProductCategory, string>,
)

export function isValidProductCategory(v: unknown): v is ProductCategory {
  return typeof v === 'string' && PRODUCT_CATEGORIES.some(c => c.value === v)
}
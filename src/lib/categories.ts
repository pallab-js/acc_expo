import { Category } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-housing', name: 'Housing', icon: 'home-outline', color: '#0F172A', kind: 'expense' },
  { id: 'cat-food', name: 'Food & Dining', icon: 'restaurant-outline', color: '#F97316', kind: 'expense' },
  { id: 'cat-groceries', name: 'Groceries', icon: 'cart-outline', color: '#10B981', kind: 'expense' },
  { id: 'cat-transport', name: 'Transport', icon: 'car-outline', color: '#3B82F6', kind: 'expense' },
  { id: 'cat-utilities', name: 'Utilities', icon: 'flash-outline', color: '#F59E0B', kind: 'expense' },
  { id: 'cat-shopping', name: 'Shopping', icon: 'bag-handle-outline', color: '#EC4899', kind: 'expense' },
  { id: 'cat-health', name: 'Health', icon: 'fitness-outline', color: '#EF4444', kind: 'expense' },
  { id: 'cat-fun', name: 'Entertainment', icon: 'game-controller-outline', color: '#8B5CF6', kind: 'expense' },
  { id: 'cat-education', name: 'Education', icon: 'school-outline', color: '#06B6D4', kind: 'expense' },
  { id: 'cat-travel', name: 'Travel', icon: 'airplane-outline', color: '#14B8A6', kind: 'expense' },
  { id: 'cat-expense-other', name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#64748B', kind: 'expense' },
  { id: 'cat-salary', name: 'Salary', icon: 'briefcase-outline', color: '#10B981', kind: 'income' },
  { id: 'cat-freelance', name: 'Freelance', icon: 'laptop-outline', color: '#3B82F6', kind: 'income' },
  { id: 'cat-investment', name: 'Investment', icon: 'trending-up-outline', color: '#8B5CF6', kind: 'income' },
  { id: 'cat-gift', name: 'Gift', icon: 'gift-outline', color: '#EC4899', kind: 'income' },
  { id: 'cat-income-other', name: 'Other Income', icon: 'add-circle-outline', color: '#64748B', kind: 'income' },
];

const byId = new Map(DEFAULT_CATEGORIES.map((category) => [category.id, category]));

export function getCategory(id: string): Category {
  return (
    byId.get(id) ?? {
      id,
      name: 'Unknown',
      icon: 'ellipsis-horizontal-outline',
      color: '#64748B',
      kind: 'expense',
    }
  );
}

export function categoriesFor(kind: 'income' | 'expense'): Category[] {
  return DEFAULT_CATEGORIES.filter((category) => category.kind === kind);
}

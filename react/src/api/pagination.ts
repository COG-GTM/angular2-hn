export const PAGE_SIZE = 30

export function listStart(page: number): number {
  return (page - 1) * PAGE_SIZE + 1
}

export function hasPreviousPage(page: number): boolean {
  return listStart(page) !== 1
}

export function hasNextPage(itemCount: number): boolean {
  return itemCount === PAGE_SIZE
}

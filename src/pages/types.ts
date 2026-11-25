export type Review = { id: string; initials: string; title: string; author: string; pro: string; age: string; rating: number; tone: 'Praise' | 'Mixed' | 'Concern'; avatar?: string };
export type Person = { id: string; initials: string; name: string; role: string; reviews: number; rating: number; detail: string; tone?: string };
export type DocumentItem = { id: string; name: string; type: string; owner: string; date: string; status: 'Needs check' | 'Approved' | 'Draft' };

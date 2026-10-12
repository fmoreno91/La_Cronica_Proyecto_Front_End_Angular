import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  date: string;
  image: string;
  featured: boolean;
}

export interface NewArticle {
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
}

const NEWS_STORAGE_KEY = 'lacronica_news';
const FAVORITES_STORAGE_KEY = 'lacronica_favorites';
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop&auto=format',
];

function isArticle(value: unknown): value is Article {
  if (typeof value !== 'object' || value === null) return false;
  const article = value as Record<string, unknown>;
  return typeof article['id'] === 'number'
    && typeof article['title'] === 'string'
    && typeof article['summary'] === 'string'
    && typeof article['content'] === 'string'
    && typeof article['category'] === 'string'
    && typeof article['author'] === 'string'
    && typeof article['date'] === 'string'
    && typeof article['image'] === 'string'
    && typeof article['featured'] === 'boolean';
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);

  readonly articles = signal<Article[]>([]);
  readonly favoriteIds = signal<number[]>(this.readFavorites());
  readonly loading = signal(true);
  readonly loadError = signal(false);

  async loadNoticias(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);

    const stored = localStorage.getItem(NEWS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(isArticle)) {
          this.articles.set(parsed);
          this.removeDeletedFavorites(parsed);
          this.loading.set(false);
          return;
        }
        throw new Error('Los datos guardados de noticias no tienen el formato esperado.');
      } catch (error) {
        console.warn('Los datos guardados de noticias están dañados; se cargarán de nuevo.', error);
        localStorage.removeItem(NEWS_STORAGE_KEY);
      }
    }

    try {
      const dataUrl = new URL('data/noticias.json', document.baseURI).toString();
      const articles = await firstValueFrom(this.http.get<unknown>(dataUrl));
      if (!Array.isArray(articles) || !articles.every(isArticle)) {
        throw new Error('El archivo data/noticias.json no contiene una lista válida de noticias.');
      }
      this.articles.set(articles);
      this.removeDeletedFavorites(articles);
      this.saveArticles();
      this.loading.set(false);
    } catch (error) {
      console.error('No se pudo cargar la fuente inicial de noticias.', error);
      this.loadError.set(true);
      this.loading.set(false);
    }
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds().includes(id);
  }

  toggleFavorite(id: number): void {
    const current = this.favoriteIds();
    const next = current.includes(id)
      ? current.filter((favoriteId) => favoriteId !== id)
      : [...current, id];
    this.favoriteIds.set(next);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
  }

  addArticle(data: NewArticle): void {
    const articles = this.articles();
    const id = articles.reduce((maximum, article) => Math.max(maximum, article.id), 0) + 1;
    const article: Article = {
      ...data,
      id,
      date: new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
      image: FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)],
      featured: false,
    };
    this.articles.set([article, ...articles]);
    this.saveArticles();
  }

  deleteArticle(id: number): void {
    this.articles.update((articles) => articles.filter((article) => article.id !== id));
    this.favoriteIds.update((favorites) => favorites.filter((favoriteId) => favoriteId !== id));
    this.saveArticles();
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(this.favoriteIds()));
  }

  private readFavorites(): number[] {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    try {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every((id) => typeof id === 'number')) return parsed;
      throw new Error('La lista de favoritos no tiene el formato esperado.');
    } catch (error) {
      console.warn('Los favoritos guardados están dañados; se iniciará una lista vacía.', error);
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
      return [];
    }
  }

  private removeDeletedFavorites(articles: Article[]): void {
    const validIds = new Set(articles.map((article) => article.id));
    const validFavorites = this.favoriteIds().filter((id) => validIds.has(id));
    if (validFavorites.length !== this.favoriteIds().length) {
      this.favoriteIds.set(validFavorites);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(validFavorites));
    }
  }

  private saveArticles(): void {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(this.articles()));
  }
}

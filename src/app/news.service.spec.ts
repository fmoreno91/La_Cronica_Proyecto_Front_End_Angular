import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Article, NewsService } from './news.service';

const article: Article = {
  id: 1,
  title: 'Noticia de prueba',
  summary: 'Resumen de prueba',
  content: 'Contenido de prueba',
  category: 'Ciencia',
  author: 'Equipo editorial',
  date: '12 de octubre, 2026',
  image: 'https://example.com/image.jpg',
  featured: true,
};

describe('NewsService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads and persists the initial article catalog', async () => {
    const service = TestBed.inject(NewsService);
    const loading = service.loadNoticias();
    http.expectOne((request) => request.url.endsWith('/data/noticias.json')).flush([article]);
    await loading;

    expect(service.articles()).toEqual([article]);
    expect(service.loading()).toBe(false);
    expect(JSON.parse(localStorage.getItem('lacronica_news') ?? '[]')).toEqual([article]);
  });

  it('persists favorite changes and removes favorites when an article is deleted', async () => {
    localStorage.setItem('lacronica_news', JSON.stringify([article]));
    const service = TestBed.inject(NewsService);
    await service.loadNoticias();

    service.toggleFavorite(article.id);
    expect(service.favoriteIds()).toEqual([article.id]);
    service.deleteArticle(article.id);

    expect(service.articles()).toEqual([]);
    expect(service.favoriteIds()).toEqual([]);
    expect(JSON.parse(localStorage.getItem('lacronica_favorites') ?? 'null')).toEqual([]);
  });

  it('creates a new article with a unique id and persists it', async () => {
    localStorage.setItem('lacronica_news', JSON.stringify([article]));
    const service = TestBed.inject(NewsService);
    await service.loadNoticias();

    service.addArticle({
      title: 'Otra noticia',
      summary: 'Otro resumen',
      content: 'Otro contenido',
      category: 'Tecnología',
      author: 'Equipo editorial',
    });

    expect(service.articles()[0].id).toBe(article.id + 1);
    expect(JSON.parse(localStorage.getItem('lacronica_news') ?? '[]')).toHaveLength(2);
  });
});

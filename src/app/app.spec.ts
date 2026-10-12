import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { NewsService } from './news.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: NewsService,
          useValue: {
            articles: signal([]),
            favoriteIds: signal([]),
            loading: signal(false),
            loadError: signal(false),
            loadNoticias: () => Promise.resolve(),
            isFavorite: () => false,
            toggleFavorite: () => undefined,
          },
        },
      ],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the La Crónica brand and navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.site-logo-name')?.textContent).toContain('La Crónica');
    expect(compiled.querySelector('.site-nav')?.textContent).toContain('Noticias');
  });
});

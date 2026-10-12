import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { NewsCardComponent } from './news-card.component';
import { Article, NewsService } from './news.service';

@Component({
  standalone: true,
  imports: [NewsCardComponent, RouterLink],
  templateUrl: './pages/home.page.html',
})
export class HomePage {
  protected readonly news = inject(NewsService);
  protected readonly featured = computed(() => this.news.articles().filter((article) => article.featured));
  protected readonly recent = computed(() => this.news.articles().filter((article) => !article.featured).slice(0, 3));
  protected readonly hero = computed(() => this.featured()[0]);
}

@Component({
  standalone: true,
  imports: [NewsCardComponent],
  templateUrl: './pages/news.page.html',
})
export class NewsPage {
  protected readonly news = inject(NewsService);
  protected readonly categories = ['Todas', 'Tecnología', 'Educación', 'Turismo', 'Comercio', 'Ciencia'];
  protected readonly searchTerm = signal('');
  protected readonly currentCategory = signal('Todas');
  protected readonly filteredArticles = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    return this.news.articles().filter((article) => {
      const matchesCategory = this.currentCategory() === 'Todas' || article.category === this.currentCategory();
      const matchesSearch = !term
        || article.title.toLocaleLowerCase().includes(term)
        || article.summary.toLocaleLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  });
}

@Component({
  standalone: true,
  imports: [NewsCardComponent, RouterLink],
  templateUrl: './pages/favorites.page.html',
})
export class FavoritesPage {
  protected readonly news = inject(NewsService);
  protected readonly favorites = computed(() => {
    const ids = new Set(this.news.favoriteIds());
    return this.news.articles().filter((article) => ids.has(article.id));
  });
}

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pages/detail.page.html',
})
export class NewsDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly news = inject(NewsService);
  protected readonly articleId = signal<number | null>(null);
  protected readonly article = computed(
    () => this.news.articles().find((item) => item.id === this.articleId()) ?? null,
  );

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));
      this.articleId.set(Number.isInteger(id) && id > 0 ? id : null);
      const article = this.article();
      this.title.setTitle(article ? `${article.title} — La Crónica` : 'Noticia no encontrada — La Crónica');
    });
  }

  protected paragraphs(article: Article): string[] {
    return article.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  }
}

@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pages/contact.page.html',
})
export class ContactPage {
  protected success = false;
  protected sentName = '';
  protected sentEmail = '';

  protected submit(form: NgForm): void {
    const { name = '', email = '', subject = '', message = '' } = form.value as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };
    if (form.invalid || !name.trim() || !email.trim() || !subject.trim() || message.trim().length < 20) {
      form.control.markAllAsTouched();
      return;
    }
    this.sentName = name.trim();
    this.sentEmail = email.trim();
    this.success = true;
  }

  protected sendAnother(): void {
    this.success = false;
  }
}

@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pages/admin.page.html',
})
export class AdminPage {
  protected readonly news = inject(NewsService);
  protected readonly categories = ['Tecnología', 'Educación', 'Turismo', 'Comercio', 'Ciencia'];
  protected readonly draft = {
    title: '',
    category: 'Tecnología',
    author: '',
    summary: '',
    content: '',
  };
  protected confirmingDeleteId: number | null = null;
  protected created = false;

  protected publish(form: NgForm): void {
    if (
      form.invalid
      || !this.draft.title.trim()
      || !this.draft.author.trim()
      || !this.draft.summary.trim()
      || !this.draft.content.trim()
    ) {
      form.control.markAllAsTouched();
      return;
    }
    this.news.addArticle({
      title: this.draft.title.trim(),
      category: this.draft.category,
      author: this.draft.author.trim(),
      summary: this.draft.summary.trim(),
      content: this.draft.content.trim(),
    });
    form.resetForm({ title: '', category: 'Tecnología', author: '', summary: '', content: '' });
    this.created = true;
    this.confirmingDeleteId = null;
  }

  protected deleteArticle(id: number): void {
    this.news.deleteArticle(id);
    this.confirmingDeleteId = null;
  }
}

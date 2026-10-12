import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NewsService } from './news.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly news = inject(NewsService);
  protected readonly today = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  protected mobileMenuOpen = false;

  ngOnInit(): void {
    void this.news.loadNoticias();
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}

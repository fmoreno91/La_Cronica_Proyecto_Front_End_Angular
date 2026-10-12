import { Routes } from '@angular/router';
import {
  AdminPage,
  ContactPage,
  FavoritesPage,
  HomePage,
  NewsDetailPage,
  NewsPage,
} from './pages';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Inicio — La Crónica' },
  { path: 'noticias', pathMatch: 'full', component: NewsPage, title: 'Noticias — La Crónica' },
  { path: 'noticias/:id', component: NewsDetailPage },
  { path: 'noticia/:id', redirectTo: 'noticias/:id' },
  { path: 'favoritos', component: FavoritesPage, title: 'Favoritos — La Crónica' },
  { path: 'contacto', component: ContactPage, title: 'Contacto — La Crónica' },
  { path: 'admin', component: AdminPage, title: 'Administrar — La Crónica' },
  { path: 'index.html', redirectTo: '' },
  { path: 'noticias.html', redirectTo: 'noticias' },
  { path: 'favoritos.html', redirectTo: 'favoritos' },
  { path: 'contacto.html', redirectTo: 'contacto' },
  { path: 'admin.html', redirectTo: 'admin' },
  { path: 'detalle.html', redirectTo: 'noticias' },
  { path: '**', redirectTo: '' },
];

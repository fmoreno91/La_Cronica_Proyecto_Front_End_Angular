import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from './news.service';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './news-card.component.html',
})
export class NewsCardComponent {
  @Input({ required: true }) article!: Article;
  @Input() favorite = false;
  @Output() favoriteToggled = new EventEmitter<number>();
}

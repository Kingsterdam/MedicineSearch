import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { MedicineSuggestionsComponent } from './medicine-suggestions/medicine-suggestions.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchComponent, MedicineSuggestionsComponent, HeaderComponent],
  templateUrl: './app.component.html' // Make sure this path is correct
})
export class AppComponent {
  title = 'medicine-search';
}

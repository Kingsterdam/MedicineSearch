import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { provideHttpClient, withFetch } from '@angular/common/http'; // Updated import
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { MedicineSuggestionsComponent } from './medicine-suggestions/medicine-suggestions.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    MedicineSuggestionsComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    MarkdownModule.forRoot()
  ],
  providers: [
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
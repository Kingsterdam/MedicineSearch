import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Import HttpClient and HttpErrorResponse
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-medicine-suggestions',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './medicine-suggestions.component.html',
  styleUrls: ['./medicine-suggestions.component.css']
})
export class MedicineSuggestionsComponent implements OnInit {
  medicines: string[] = [];

  private apiUrl = 'https://api.fda.gov/drug/drugsfda.json?limit=100'; // Adjusted limit for demonstration

  constructor(private http: HttpClient) { }


  ngOnInit(): void {
    console.log('MedicineSuggestionsComponent initialized');
    this.fetchMedicines();
  }

  @Output() suggestionSelected = new EventEmitter<string>();

  selectSuggestion(suggestion: string) {
    this.suggestionSelected.emit(suggestion);
  }



  fetchMedicines(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        if (response.results && Array.isArray(response.results)) {
          const products = response.results.flatMap((item: any) =>
            item.products ? item.products.map((product: any) => product.brand_name) : []
          );
  
          // Selecting random medicines from the list
          this.medicines = this.getRandomMedicines(products, 8);
        } else {
          console.warn('No results found in the API response');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading medicines', err);
      }
    });
  }
  

  getRandomMedicines(arr: string[], num: number): string[] {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  }
}

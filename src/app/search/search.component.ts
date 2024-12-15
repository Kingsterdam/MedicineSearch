import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MedicineSuggestionsComponent } from '../medicine-suggestions/medicine-suggestions.component';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from 'express';

interface MedicineResponse {
  brandName: string;
  dosage?: string;
  genericName: string;
  indications?: string;   // Optional
  interactions?: string;  // Add this
  purpose?: string;       // Optional
  sideEffects?: string;   // Optional
  warnings?: string;      // Optional
}

interface Candidate {
  rxcui: string;
  rxaui: string;
  score: string;
  rank: string;
  name?: string; 
  source: string;
}

interface Suggestions {
  approximateGroup: {
    inputTerm: string | null;
    candidate: Candidate[];
  };
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MedicineSuggestionsComponent,
    HeaderComponent
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  searchQuery: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  searchResults: MedicineResponse | null = null;
  summarizedContent: string = '';
  summaryResult: string = '';
  formattedText: SafeHtml = '';
  selectedLanguage: string = 'english';
  suggestions: string[] = [];
  isHome : boolean = true;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  searchMedicine(): void {
    this.isHome = false
    if (!this.searchQuery.trim()) {
      this.error = 'Please enter a medicine name to search.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.searchResults = null;
    this.formattedText = '';

    const apiUrl = `https://backend-medicine-dpu17zja5-amit-mishras-projects-3515f952.vercel.app/api/medicine/search?name=${encodeURIComponent(this.searchQuery.trim())}`;

    this.http.get<MedicineResponse>(apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching search results:', error);
        this.error = 'No Medicine Found !!!';
        return of(null); // Return null on error
      })
    ).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.isLoading = false;
        this.searchQuery = '';
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  async summarize(): Promise<void> {
    if (this.searchResults) {
      this.summarizedContent = `Brand Name: ${this.searchResults.brandName}.\n` +
        `Generic Name: ${this.searchResults.genericName}.\n` +
        `Purpose: ${this.searchResults.purpose || 'N/A'}.\n` +
        `Indications: ${this.searchResults.indications || 'N/A'}`;

      try {
        this.isLoading = true; 
        const genAI = new GoogleGenerativeAI("AIzaSyCSxv7kIOWNSQar1jitoHOUzWRyIAokN5c"); // Replace with your API key securely
        const model = await genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `You are an AI expert. Please give the summary in detail of this medicine information: ${this.summarizedContent} for uses and side effects of this medicine.
        Strictly follow this: Give the summary in ${this.selectedLanguage} language`;

        const result = await model.generateContent(prompt);
        this.summaryResult = result.response.text(); 
        
        // Sanitize and format the text
        this.formattedText = this.sanitizer.bypassSecurityTrustHtml(this.formatText(this.summaryResult));
        console.log(this.formattedText);
      } catch (error) {
        console.error("Error generating AI summary:", error);
      }
      finally{
        this.isLoading=false;
      }
    } else {
      console.log("No content available to summarize.");
    }
  }

  formatText(input: string): string {
    // Handle empty input
    if (!input || input.trim() === '') {
        return '';
    }

    // Normalize line endings and split by lines
    const sections: string[] = input
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    let formattedText: string = '';
    let isInBulletList: boolean = false;
    let currentListItems: string[] = [];

    for (let i = 0; i < sections.length; i++) {
        let section = sections[i];
        
        // Handle bold text (process this first)
        section = section.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        // Check if it's a bullet point
        if (section.startsWith('* ')) {
            // Remove the bullet marker
            const bulletContent = section.substring(2);
            
            // If we weren't in a list before, start a new one
            if (!isInBulletList) {
                isInBulletList = true;
                currentListItems = [];
            }
            
            currentListItems.push(`<li>${bulletContent}</li>`);
        } else {
            // If we were in a list and now we're not, close the list
            if (isInBulletList) {
                formattedText += `<ul>${currentListItems.join('')}</ul>`;
                isInBulletList = false;
                currentListItems = [];
            }

            // Handle paragraphs with asterisks as separators
            if (section.includes('*')) {
                const paragraphs = section.split('*').filter(Boolean);
                formattedText += paragraphs
                    .map(p => `<p>${p.trim()}</p>`)
                    .join('');
            }
            // Handle regular paragraphs
            else {
                formattedText += `<p>${section}</p>`;
            }
        }
    }

    // Close any remaining bullet list
    if (isInBulletList && currentListItems.length > 0) {
        formattedText += `<ul>${currentListItems.join('')}</ul>`;
    }

    // Clean up any potential double spaces or unnecessary breaks
    return formattedText
        .replace(/\s+/g, ' ')
        .replace(/><br>/g, '>')
        .replace(/\s+</g, '<')
        .replace(/>\s+/g, '>')
        .trim();
}


onInputChange(): void {
  this.isHome = false
  if (this.searchQuery) {
    this.isLoading = true;
    this.http
      .get<Suggestions>(`https://rxnav.nlm.nih.gov/REST/approximateTerm?term=${this.searchQuery}&maxEntries=10`)
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe({
        next: (data) => {
          this.suggestions = data.approximateGroup.candidate
            .filter(candidate => candidate.name !== undefined)
            .map(candidate => candidate.name!);
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Error fetching suggestions';
          this.isLoading = false;
        }
      });
  } else {
    this.suggestions = [];
  }
}


selectSuggestion(suggestion: string): void {
  this.searchQuery = suggestion;
  this.suggestions = [];
}
onSuggestionSelected(suggestion: string) :void{
  this.searchQuery=suggestion;
  this.suggestions = [];
  this.searchMedicine();
}

}
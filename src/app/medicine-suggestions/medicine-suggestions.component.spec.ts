import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineSuggestionsComponent } from './medicine-suggestions.component';

describe('MedicineSuggestionsComponent', () => {
  let component: MedicineSuggestionsComponent;
  let fixture: ComponentFixture<MedicineSuggestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineSuggestionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineSuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

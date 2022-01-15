import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnzeigenComponent } from './anzeigen.component';

describe('AnzeigenComponent', () => {
  let component: AnzeigenComponent;
  let fixture: ComponentFixture<AnzeigenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnzeigenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnzeigenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

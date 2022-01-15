import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StellenangeboteComponent } from './stellenangebote.component';

describe('AnzeigenComponent', () => {
  let component: StellenangeboteComponent;
  let fixture: ComponentFixture<StellenangeboteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StellenangeboteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StellenangeboteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

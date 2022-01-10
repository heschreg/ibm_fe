import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BewerberComponent } from './bewerber.component';

describe('BewerberComponent', () => {
  let component: BewerberComponent;
  let fixture: ComponentFixture<BewerberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BewerberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BewerberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

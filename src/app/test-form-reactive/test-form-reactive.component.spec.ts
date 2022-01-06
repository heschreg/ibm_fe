import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFormReactiveComponent } from './test-form-reactive.component';

describe('TestFormReactiveComponent', () => {
  let component: TestFormReactiveComponent;
  let fixture: ComponentFixture<TestFormReactiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestFormReactiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFormReactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

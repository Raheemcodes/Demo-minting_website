import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorSvgComponent } from './error-svg.component';

describe('ErrorSvgComponent', () => {
  let component: ErrorSvgComponent;
  let fixture: ComponentFixture<ErrorSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorSvgComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

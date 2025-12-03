import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIeditscorecard } from './aieditscorecard';

describe('AIeditscorecard', () => {
  let component: AIeditscorecard;
  let fixture: ComponentFixture<AIeditscorecard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIeditscorecard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AIeditscorecard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

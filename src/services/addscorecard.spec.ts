import { TestBed } from '@angular/core/testing';

import { Addscorecard } from './addscorecard';

describe('Addscorecard', () => {
  let service: Addscorecard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Addscorecard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

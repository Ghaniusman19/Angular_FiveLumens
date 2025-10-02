import { TestBed } from '@angular/core/testing';

import { Editscorecard } from './editscorecard';

describe('Editscorecard', () => {
  let service: Editscorecard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Editscorecard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

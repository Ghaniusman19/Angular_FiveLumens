import { TestBed } from '@angular/core/testing';

import { editscorecard } from './editscorecard';

describe('Editscorecard', () => {
  let service: editscorecard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(editscorecard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

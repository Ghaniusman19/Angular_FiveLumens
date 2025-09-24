import { TestBed } from '@angular/core/testing';

import { FetchAPIData } from './fetch-apidata';

describe('FetchAPIData', () => {
  let service: FetchAPIData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchAPIData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { TableViewService } from './table-view.service';

describe('TableViewService', () => {
  let service: TableViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

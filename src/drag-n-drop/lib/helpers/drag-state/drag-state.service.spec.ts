import { TestBed } from '@angular/core/testing';

import { DragStateService } from './drag-state.service';

describe('DragStateService', () => {
  let service: DragStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

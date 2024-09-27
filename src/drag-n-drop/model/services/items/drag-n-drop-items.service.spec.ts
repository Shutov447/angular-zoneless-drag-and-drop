import { TestBed } from '@angular/core/testing';

import { DragNDropItemsService } from './drag-n-drop-items.service';

describe('DragNDropItemsService', () => {
  let service: DragNDropItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragNDropItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { DragNDropCoverageService } from './drag-n-drop-coverage.service';

describe('DragNDropCoverageService', () => {
    let service: DragNDropCoverageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DragNDropCoverageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

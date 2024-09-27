import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { IPosition } from '../../types';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PositionService } from '../position';
import { DragNDropCoverageService } from '../coverage';

@Injectable({
    providedIn: 'root',
})
export class DragStateService {
    private readonly destroyRef = inject(DestroyRef);
    private readonly coverageService = inject(DragNDropCoverageService);
    private readonly coveredSiblingPosition = new Subject<
        PositionService | undefined
    >();
    private startDragY = 0;
    private startDragX = 0;

    readonly isStartDrag = signal(false);
    readonly isDraggedItemNow = signal(false);

    setCoveredSiblingPosition(siblingPosition: PositionService | undefined) {
        this.coveredSiblingPosition.next(siblingPosition);
    }

    setDragStartState(x: number, y: number) {
        this.startDragY = y;
        this.startDragX = x;
        this.isStartDrag.set(true);
        this.isDraggedItemNow.set(true);
    }

    getDragItemOffset(x: number, y: number, relativePos: IPosition) {
        return {
            top: y + relativePos.top - this.startDragY,
            left: x + relativePos.left - this.startDragX,
        };
    }

    whenSiblingCovered(
        handler: (positionStorage: PositionService) => void,
        context?: unknown,
    ) {
        this.coveredSiblingPosition
            .asObservable()
            .pipe(
                distinctUntilChanged(),
                debounceTime(this.coverageService.getTime()),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((target) => {
                if (target && this.isStartDrag()) {
                    context ? handler.call(context, target) : handler(target);
                }
            });
    }
}

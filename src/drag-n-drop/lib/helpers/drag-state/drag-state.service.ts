import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DragStateService {
    private startDragY = 0;
    private startDragX = 0;

    readonly isStartDrag = signal(false);
    readonly isDraggedItemNow = signal(false);
    readonly position = signal({ top: 0, left: 0 });

    setDragStartState(x: number, y: number) {
        this.startDragY = y;
        this.startDragX = x;
        this.isStartDrag.set(true);
        this.isDraggedItemNow.set(true);
    }

    setStartPosition(startPosition: { top: number; left: number }) {
        this.position.set(startPosition);
        this.isStartDrag.set(false);
    }

    elemOffsetToPoint(x: number, y: number, top: number, left: number) {
        this.position.set({
            top: y + top - this.startDragY,
            left: x + left - this.startDragX,
        });
    }

    getPosition() {
        return this.position();
    }
}

import { computed, Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PositionService {
    readonly positionType = signal('');
    readonly currentPosition = signal({
        top: 0,
        left: 0,
    });
    readonly transitionTime = signal(0);
    private readonly _isStartSwitching = signal(false);
    readonly isStartSwitching = computed(() => this._isStartSwitching());

    containerRelativeStartPos = {
        top: 0,
        left: 0,
    };
    containerRelativeStartPosAfterSwitching = {
        top: 0,
        left: 0,
    };

    private setInitialPos(dndContainerDomRect: DOMRect, dndElem: HTMLElement) {
        const marginTop = parseFloat(getComputedStyle(dndElem).marginTop);
        const marginLeft = parseFloat(getComputedStyle(dndElem).marginLeft);
        const domRect = dndElem.getBoundingClientRect();
        const top = domRect.y - dndContainerDomRect.y - marginTop;
        const left = domRect.x - dndContainerDomRect.x - marginLeft;

        this.containerRelativeStartPos = {
            top,
            left,
        };
        this.containerRelativeStartPosAfterSwitching = {
            top,
            left,
        };
        this.currentPosition.set({
            top,
            left,
        });

        window.setTimeout(() => this.positionType.set('absolute'));
    }

    transformInitialSetupToAbsolutePos(
        dndContainerElem: HTMLElement,
        dndElem: HTMLElement,
    ) {
        const dndContainerDomRect = dndContainerElem.getBoundingClientRect();
        const oldDndContainerHeight = dndContainerDomRect.height;
        const oldDndContainerWidth = dndContainerDomRect.width;

        this.setInitialPos(dndContainerDomRect, dndElem);

        dndContainerElem.style.height = oldDndContainerHeight + 'px';
        dndContainerElem.style.width = oldDndContainerWidth + 'px';
    }

    switchStartPosition(dndItemPos: PositionService) {
        dndItemPos.setIsStartSwitching(true);

        const oldContainerRelativeStartPosAfterSwitching =
            this.containerRelativeStartPosAfterSwitching;
        const oldDndItemContainerRelativeStartPos =
            dndItemPos.containerRelativeStartPos;

        dndItemPos.containerRelativeStartPos =
            oldContainerRelativeStartPosAfterSwitching;
        dndItemPos.containerRelativeStartPosAfterSwitching =
            oldContainerRelativeStartPosAfterSwitching;

        this.containerRelativeStartPosAfterSwitching =
            oldDndItemContainerRelativeStartPos;

        dndItemPos.currentPosition.set(
            oldContainerRelativeStartPosAfterSwitching,
        );

        dndItemPos.setIsStartSwitching(false);
    }

    setIsStartSwitching(isStart: boolean) {
        if (isStart) {
            this._isStartSwitching.set(true);
        } else {
            window.setTimeout(
                () => this._isStartSwitching.set(false),
                this.transitionTime(),
            );
        }
    }
}

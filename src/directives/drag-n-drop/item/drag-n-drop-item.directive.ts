import {
    computed,
    Directive,
    effect,
    ElementRef,
    HostListener,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { DragNDropService } from '../service/drag-n-drop.service';
import { isSufficientCovered } from '../lib';

@Directive({
    selector: '[appDragNDropItem]',
    host: {
        '[style.zIndex]': 'zIndex()',
        '[style.cursor]': 'this.isStartDrag() ? "grabbing" : "grab"',
        '[style.top]': 'position().top + "px"',
        '[style.left]': 'position().left + "px"',
    },
})
export class DragNDropItemDirective implements OnInit {
    private readonly eRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly elem = this.eRef.nativeElement;
    private readonly dndService = inject(DragNDropService);
    private readonly init = signal(false);
    private readonly isStartDrag = signal(false);
    private readonly isDraggedItemNow = signal(false);
    private readonly zIndex = signal(1);
    private readonly position = signal({
        top: 0,
        left: 0,
    });
    private readonly absoluteInitialPosX = this.elem.getBoundingClientRect().x;
    private readonly absoluteInitialPosY = this.elem.getBoundingClientRect().y;
    private readonly dndSiblingItems = computed(() =>
        this.init()
            ? this.dndService
                  .dndItems()
                  ?.filter(
                      ({ absoluteInitialPosX, absoluteInitialPosY }) =>
                          !(
                              absoluteInitialPosX ===
                                  this.absoluteInitialPosX &&
                              absoluteInitialPosY === this.absoluteInitialPosY
                          )
                  )
            : []
    );
    private readonly dndElemContainerEffect = effect(
        () => {
            const dndContainerElem =
                this.dndService.dndElemContainer() as HTMLElement;

            dndContainerElem && this.transformInitialSetup(dndContainerElem);
        },
        { allowSignalWrites: true }
    );

    private containerRelativeStartPos = {
        top: 0,
        left: 0,
    };
    private startDragY = 0;
    private startDragX = 0;

    ngOnInit() {
        this.init.set(true);
    }

    @HostListener('window:mouseup')
    private onWindowMouseup() {
        if (this.isDraggedItemNow()) {
            this.setStartPosition();
            this.setContainerRelativeStartPosAfterSwitching();
            this.isDraggedItemNow.set(false);
        }
    }

    @HostListener('mousedown', ['$event'])
    private onMousedown(event: MouseEvent) {
        this.setDragStartState(event.x, event.y);
    }

    @HostListener('mousemove', ['$event'])
    private onMousemove(event: MouseEvent) {
        if (this.isStartDrag()) {
            const coveredSibling = this.getCoveredSibling();

            coveredSibling
                ? this.switchStartPosition(coveredSibling)
                : this.elemOffsetToPoint(event.x, event.y);
        }
    }

    @HostListener('mouseup')
    private onMouseup() {
        this.setStartPosition();
        this.setContainerRelativeStartPosAfterSwitching();
        this.containerRelativeStartPos =
            this.coveredSiblingRelativeStartPosAfterSwitching;
    }

    private transformInitialSetup(dndContainerElem: HTMLElement) {
        const dndContainerDomRect = dndContainerElem.getBoundingClientRect();
        const oldDndContainerHeight = dndContainerDomRect.height;
        const oldDndContainerWidth = dndContainerDomRect.width;

        this.setContainerRelativeStartPos(dndContainerDomRect);
        this.setElementPositionToAbsolute();

        dndContainerElem.style.height = oldDndContainerHeight + 'px';
        dndContainerElem.style.width = oldDndContainerWidth + 'px';
    }

    private setElementPositionToAbsolute() {
        this.position.set({
            top: this.containerRelativeStartPos.top,
            left: this.containerRelativeStartPos.left,
        });

        window.setTimeout(() => (this.elem.style.position = 'absolute'));
    }

    private setContainerRelativeStartPos(dndContainerDomRect: DOMRect) {
        const domRect = this.elem.getBoundingClientRect();
        const top =
            domRect.y -
            dndContainerDomRect.y -
            parseFloat(getComputedStyle(this.elem).marginTop);
        const left =
            domRect.x -
            dndContainerDomRect.x -
            parseFloat(getComputedStyle(this.elem).marginLeft);

        this.containerRelativeStartPos = {
            top,
            left,
        };
        this.containerRelativeStartPosAfterSwitching = {
            top,
            left,
        };
        this.coveredSiblingRelativeStartPosAfterSwitching = {
            top,
            left,
        };
    }

    private containerRelativeStartPosAfterSwitching = {
        top: 0,
        left: 0,
    };
    private coveredSiblingRelativeStartPosAfterSwitching = {
        top: 0,
        left: 0,
    };
    private switchStartPosition(dndItem: DragNDropItemDirective) {
        const oldContainerRelativeStartPosAfterSwitching =
            this.containerRelativeStartPosAfterSwitching;
        const oldDndItemContainerRelativeStartPos =
            dndItem.containerRelativeStartPos;
        const oldDndItemContainerRelativeStartPosAfterSwitching =
            dndItem.containerRelativeStartPosAfterSwitching;

        dndItem.containerRelativeStartPos =
            oldContainerRelativeStartPosAfterSwitching;
        dndItem.containerRelativeStartPosAfterSwitching =
            oldContainerRelativeStartPosAfterSwitching;

        this.coveredSiblingRelativeStartPosAfterSwitching =
            oldDndItemContainerRelativeStartPosAfterSwitching;
        this.containerRelativeStartPosAfterSwitching =
            oldDndItemContainerRelativeStartPos;

        dndItem.setStartPosition();
    }

    private elemOffsetToPoint(x: number, y: number) {
        this.position.set({
            top: y + this.containerRelativeStartPos.top - this.startDragY,
            left: x + this.containerRelativeStartPos.left - this.startDragX,
        });
    }

    private getCoveredSibling() {
        return this.dndSiblingItems()?.find((item) =>
            isSufficientCovered(this.elem, item.elem, 50)
        );
    }

    private setDragStartState(x: number, y: number) {
        this.startDragY = y;
        this.startDragX = x;
        this.zIndex.set(999);
        this.isStartDrag.set(true);
        this.isDraggedItemNow.set(true);
    }

    private setContainerRelativeStartPosAfterSwitching() {
        this.containerRelativeStartPos =
            this.coveredSiblingRelativeStartPosAfterSwitching;
    }

    setStartPosition() {
        this.position.set({
            top: this.containerRelativeStartPosAfterSwitching.top,
            left: this.containerRelativeStartPosAfterSwitching.left,
        });
        this.zIndex.set(1);
        this.isStartDrag.set(false);
    }
}

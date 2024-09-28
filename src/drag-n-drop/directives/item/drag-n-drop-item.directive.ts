import {
    computed,
    Directive,
    ElementRef,
    HostListener,
    inject,
    OnInit,
} from '@angular/core';
import {
    DragNDropFacadeService,
    DragStateService,
    PositionService,
} from '../../lib';

@Directive({
    selector: '[appDragNDropItem]',
    providers: [DragNDropFacadeService, PositionService, DragStateService],
    host: {
        '[style.zIndex]': 'this.zIndex()',
        '[style.cursor]': 'this.cursor()',
        '[style.position]': 'this.positionService.positionType()',
        '[style.top]': 'this.top() + "px"',
        '[style.left]': 'this.left() + "px"',
        '[style.transition]': 'this.transition()',
    },
})
export class DragNDropItemDirective implements OnInit {
    private readonly dndFacadeService = inject(DragNDropFacadeService);
    private readonly isDraggedItemNow =
        this.dndFacadeService.dragStateService.isDraggedItemNow;
    private readonly isStartDrag =
        this.dndFacadeService.dragStateService.isStartDrag;
    private readonly isStartSwitching =
        this.dndFacadeService.positionService.isStartSwitching;

    readonly positionService = this.dndFacadeService.positionService;
    readonly elem = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    readonly id = this.dndFacadeService.id;

    readonly top = computed(
        () => this.dndFacadeService.positionService.currentPosition().top,
    );
    readonly left = computed(
        () => this.dndFacadeService.positionService.currentPosition().left,
    );
    readonly zIndex = computed(() => {
        const zIndex = 999;
        if (this.isStartDrag()) return zIndex;
        if (this.isStartSwitching()) return zIndex - 1;
        return 1;
    });
    readonly cursor = computed(() =>
        this.isStartDrag() ? 'grabbing' : 'grab',
    );
    readonly transition = this.dndFacadeService.transition;

    ngOnInit() {
        this.dndFacadeService.init(this.elem);
    }

    @HostListener('window:mouseup')
    private onWindowMouseup() {
        console.log();
        if (this.isDraggedItemNow()) {
            this.dndFacadeService.onMouseUp();
            this.isDraggedItemNow.set(false);
        }
    }

    @HostListener('mousedown', ['$event'])
    private onMousedown(event: MouseEvent) {
        this.dndFacadeService.onMouseDown(event.x, event.y);
    }

    @HostListener('mousemove', ['$event'])
    private onMousemove(event: MouseEvent) {
        this.isStartDrag() &&
            this.dndFacadeService.onMouseMove(event.x, event.y, this.elem);
    }

    @HostListener('mouseup')
    private onMouseup() {
        this.dndFacadeService.onMouseUp();
    }

    @HostListener('window:drag', ['$event'])
    @HostListener('window:dragend', ['$event'])
    @HostListener('window:dragenter', ['$event'])
    @HostListener('window:dragleave', ['$event'])
    @HostListener('window:dragover', ['$event'])
    @HostListener('window:dragstart', ['$event'])
    @HostListener('window:drop', ['$event'])
    @HostListener('drag', ['$event'])
    @HostListener('dragend', ['$event'])
    @HostListener('dragenter', ['$event'])
    @HostListener('dragleave', ['$event'])
    @HostListener('dragover', ['$event'])
    @HostListener('dragstart', ['$event'])
    @HostListener('drop', ['$event'])
    private eventPreventDefault(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
    }
}

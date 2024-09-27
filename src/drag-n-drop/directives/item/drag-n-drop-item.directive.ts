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
        '[style.top]': 'this.positionService.currentPosition().top + "px"',
        '[style.left]': 'this.positionService.currentPosition().left + "px"',
    },
})
export class DragNDropItemDirective implements OnInit {
    private readonly dndFacadeService = inject(DragNDropFacadeService);
    private readonly isDraggedItemNow =
        this.dndFacadeService.dragStateService.isDraggedItemNow;
    private readonly isStartDrag =
        this.dndFacadeService.dragStateService.isStartDrag;

    readonly elem = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    readonly positionService = this.dndFacadeService.positionService;
    readonly id = this.dndFacadeService.id;
    readonly zIndex = computed(() => (this.isStartDrag() ? 999 : 1));
    readonly cursor = computed(() =>
        this.isStartDrag() ? 'grabbing' : 'grab',
    );

    ngOnInit() {
        this.dndFacadeService.init(this.elem);
    }

    @HostListener('window:mouseup')
    private onWindowMouseup() {
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
}

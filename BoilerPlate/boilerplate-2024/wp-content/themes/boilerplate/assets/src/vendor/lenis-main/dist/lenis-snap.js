(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Lenis = factory());
})(this, (function () { 'use strict';

    function removeParentSticky(element) {
        const position = getComputedStyle(element).position;
        const isSticky = position === 'sticky';
        if (isSticky) {
            element.style.setProperty('position', 'static');
            element.dataset.sticky = 'true';
        }
        if (element.offsetParent) {
            removeParentSticky(element.offsetParent);
        }
    }
    function addParentSticky(element) {
        var _a;
        if (((_a = element === null || element === void 0 ? void 0 : element.dataset) === null || _a === void 0 ? void 0 : _a.sticky) === 'true') {
            element.style.removeProperty('position');
            delete element.dataset.sticky;
        }
        if (element.offsetParent) {
            addParentSticky(element.offsetParent);
        }
    }
    function offsetTop(element, accumulator = 0) {
        const top = accumulator + element.offsetTop;
        if (element.offsetParent) {
            return offsetTop(element.offsetParent, top);
        }
        return top;
    }
    function offsetLeft(element, accumulator = 0) {
        const left = accumulator + element.offsetLeft;
        if (element.offsetParent) {
            return offsetLeft(element.offsetParent, left);
        }
        return left;
    }
    function scrollTop(element, accumulator = 0) {
        const top = accumulator + element.scrollTop;
        if (element.offsetParent) {
            return scrollTop(element.offsetParent, top);
        }
        return top + window.scrollY;
    }
    function scrollLeft(element, accumulator = 0) {
        const left = accumulator + element.scrollLeft;
        if (element.offsetParent) {
            return scrollLeft(element.offsetParent, left);
        }
        return left + window.scrollX;
    }
    class SnapElement {
        constructor(element, { align = ['start'], ignoreSticky = true, ignoreTransform = false, } = {}) {
            // @ts-ignore
            this.rect = {};
            this.onWrapperResize = () => {
                let top, left;
                if (this.options.ignoreSticky)
                    removeParentSticky(this.element);
                if (this.options.ignoreTransform) {
                    top = offsetTop(this.element);
                    left = offsetLeft(this.element);
                }
                else {
                    const rect = this.element.getBoundingClientRect();
                    top = rect.top + scrollTop(this.element);
                    left = rect.left + scrollLeft(this.element);
                }
                if (this.options.ignoreSticky)
                    addParentSticky(this.element);
                this.setRect({ top, left });
            };
            this.onResize = ([entry]) => {
                const width = entry.borderBoxSize[0].inlineSize;
                const height = entry.borderBoxSize[0].blockSize;
                this.setRect({ width, height });
            };
            this.element = element;
            this.options = { align, ignoreSticky, ignoreTransform };
            // this.ignoreSticky = ignoreSticky
            // this.ignoreTransform = ignoreTransform
            this.align = [align].flat();
            // TODO: assing rect immediately
            this.wrapperResizeObserver = new ResizeObserver(this.onWrapperResize);
            this.wrapperResizeObserver.observe(document.body);
            this.onWrapperResize();
            this.resizeObserver = new ResizeObserver(this.onResize);
            this.resizeObserver.observe(this.element);
            this.setRect({
                width: this.element.offsetWidth,
                height: this.element.offsetHeight,
            });
        }
        destroy() {
            this.wrapperResizeObserver.disconnect();
            this.resizeObserver.disconnect();
        }
        setRect({ top, left, width, height, element, } = {}) {
            top = top !== null && top !== void 0 ? top : this.rect.top;
            left = left !== null && left !== void 0 ? left : this.rect.left;
            width = width !== null && width !== void 0 ? width : this.rect.width;
            height = height !== null && height !== void 0 ? height : this.rect.height;
            element = element !== null && element !== void 0 ? element : this.rect.element;
            if (top === this.rect.top &&
                left === this.rect.left &&
                width === this.rect.width &&
                height === this.rect.height &&
                element === this.rect.element)
                return;
            this.rect.top = top;
            this.rect.y = top;
            this.rect.width = width;
            this.rect.height = height;
            this.rect.left = left;
            this.rect.x = left;
            this.rect.bottom = top + height;
            this.rect.right = left + width;
        }
    }

    let index = 0;
    function uid() {
        return index++;
    }

    class Snap {
        constructor(lenis, { type = 'mandatory', lerp, easing, duration, velocityThreshold = 1, onSnapStart, onSnapComplete, } = {}) {
            this.isStopped = false;
            this.onWindowResize = () => {
                this.viewport.width = window.innerWidth;
                this.viewport.height = window.innerHeight;
            };
            this.onScroll = ({ scroll, limit, lastVelocity, velocity, isScrolling, userData, isHorizontal, }) => {
                if (this.isStopped)
                    return;
                // console.log(scroll, velocity, type)
                // return
                const isDecelerating = Math.abs(lastVelocity) > Math.abs(velocity);
                const isTurningBack = Math.sign(lastVelocity) !== Math.sign(velocity) && velocity !== 0;
                // console.log({ lastVelocity, velocity, isTurningBack, isDecelerating })
                // console.log('onScroll')
                if (Math.abs(velocity) < this.options.velocityThreshold &&
                    // !isTouching &&
                    isDecelerating &&
                    !isTurningBack &&
                    (userData === null || userData === void 0 ? void 0 : userData.initiator) !== 'snap') {
                    scroll = Math.ceil(scroll);
                    let snaps = [0, ...this.snaps.values(), limit];
                    this.elements.forEach(({ rect, align }) => {
                        let snap;
                        align.forEach((align) => {
                            if (align === 'start') {
                                snap = rect.top;
                            }
                            else if (align === 'center') {
                                snap = isHorizontal
                                    ? rect.left + rect.width / 2 - this.viewport.width / 2
                                    : rect.top + rect.height / 2 - this.viewport.height / 2;
                            }
                            else if (align === 'end') {
                                snap = isHorizontal
                                    ? rect.left + rect.width - this.viewport.width
                                    : rect.top + rect.height - this.viewport.height;
                            }
                            if (snap !== undefined) {
                                snaps.push(Math.ceil(snap));
                            }
                        });
                    });
                    snaps = snaps.sort((a, b) => Math.abs(a) - Math.abs(b));
                    let prevSnap = snaps.findLast((snap) => snap <= scroll);
                    if (prevSnap === undefined)
                        prevSnap = snaps[0];
                    const distanceToPrevSnap = Math.abs(scroll - prevSnap);
                    let nextSnap = snaps.find((snap) => snap >= scroll);
                    if (nextSnap === undefined)
                        nextSnap = snaps[snaps.length - 1];
                    const distanceToNextSnap = Math.abs(scroll - nextSnap);
                    const snap = distanceToPrevSnap < distanceToNextSnap ? prevSnap : nextSnap;
                    const distance = Math.abs(scroll - snap);
                    if (this.options.type === 'mandatory' ||
                        (this.options.type === 'proximity' && distance <= this.viewport.height)) {
                        // this.__isScrolling = true
                        // this.onSnapStart?.(snap)
                        // console.log('scroll to')
                        this.lenis.scrollTo(snap, {
                            lerp: this.options.lerp,
                            easing: this.options.easing,
                            duration: this.options.duration,
                            userData: { initiator: 'snap' },
                            onStart: () => {
                                var _a, _b;
                                (_b = (_a = this.options).onSnapStart) === null || _b === void 0 ? void 0 : _b.call(_a, snap);
                            },
                            onComplete: () => {
                                var _a, _b;
                                (_b = (_a = this.options).onSnapComplete) === null || _b === void 0 ? void 0 : _b.call(_a, snap);
                            },
                        });
                    }
                    // console.timeEnd('scroll')
                }
            };
            this.lenis = lenis;
            this.options = {
                type,
                lerp,
                easing,
                duration,
                velocityThreshold,
                onSnapStart,
                onSnapComplete,
            };
            this.elements = new Map();
            this.snaps = new Map();
            this.viewport = {
                width: window.innerWidth,
                height: window.innerHeight,
            };
            this.onWindowResize();
            window.addEventListener('resize', this.onWindowResize);
            this.lenis.on('scroll', this.onScroll);
        }
        // debug() {
        //   const element = document.createElement('div')
        //   element.style.cssText = `
        //     position: fixed;
        //     background: red;
        //     border-bottom: 1px solid red;
        //     left: 0;
        //     right: 0;
        //     top: 0;
        //     z-index: 9999;
        //   `
        //   document.body.appendChild(element)
        // }
        destroy() {
            this.lenis.off('scroll', this.onScroll);
            window.removeEventListener('resize', this.onWindowResize);
            this.elements.forEach((element) => element.destroy());
        }
        start() {
            this.isStopped = false;
        }
        stop() {
            this.isStopped = true;
        }
        add(value) {
            const id = uid();
            this.snaps.set(id, value);
            return () => this.remove(id);
        }
        remove(id) {
            this.snaps.delete(id);
        }
        addElement(element, options = {}) {
            const id = uid();
            this.elements.set(id, new SnapElement(element, options));
            return () => this.removeElement(id);
        }
        removeElement(id) {
            this.elements.delete(id);
        }
    }

    return Snap;

}));
//# sourceMappingURL=lenis-snap.js.map

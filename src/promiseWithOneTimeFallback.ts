import { noChange } from "lit";
import { AsyncDirective, directive } from "lit/async-directive.js";

class PromiseWithOneTimeFallbackDirective extends AsyncDirective {
  firstRender: boolean = true;

  render(promise: Promise<unknown>, fallback: unknown) {
    promise.then((value) => this.setValue(value));
    if (this.firstRender) {
      this.firstRender = false;

      return fallback;
    } else {
      return noChange;
    }
  }
}

const promiseWithOneTimeFallback = directive(
  PromiseWithOneTimeFallbackDirective,
);

export default promiseWithOneTimeFallback;

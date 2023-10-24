import type { App } from 'vue'

import { setLazyDirective } from './lazy'

export function setupGlobDirectives(app: App) {
  setLazyDirective(app)
}

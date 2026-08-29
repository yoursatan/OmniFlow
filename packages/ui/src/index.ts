/**
 * @omniflow/ui — 共享组件库入口
 * 导出 Button / Card / Tag 三个基础组件，供 apps/web 和 apps/desktop 复用。
 */

import OmButton from './components/OmButton.vue'
import OmCard from './components/OmCard.vue'
import OmTag from './components/OmTag.vue'

export { OmButton, OmCard, OmTag }
export type { ButtonProps, CardProps, TagProps } from './types'

export default {
  install(app: { component: (name: string, comp: unknown) => void }) {
    app.component('OmButton', OmButton)
    app.component('OmCard', OmCard)
    app.component('OmTag', OmTag)
  },
}

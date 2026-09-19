import { h } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import RotatingHero from '../../components/RotatingHero.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: {
    setup() {
      const { frontmatter } = useData()

      return () => {
        const hero = frontmatter.value.hero
        const slots = hero?.phrases?.length
          ? { 'home-hero-info': () => h(RotatingHero, { name: hero.name, phrases: hero.phrases }) }
          : {}

        return h(DefaultTheme.Layout, null, slots)
      }
    }
  }
}

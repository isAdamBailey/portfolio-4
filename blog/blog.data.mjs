import { createContentLoader } from 'vitepress'

export default createContentLoader('blog/*.md', {
    transform(rawData) {
        return rawData.sort((a, b) => {
            return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
        }).filter((page) => {
            // Only include featured blog posts
            return page.frontmatter.featured
        }).map((page) => {
            return {
                page,
                frontmatter: page.frontmatter,
                url: page.url,
            }
        })
    }
})
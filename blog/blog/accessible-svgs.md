---
title: "Accessible SVGs: Roles, Alt Text, title and desc"
description: "Make SVGs accessible with roles, alt text, and title/desc. Learn when to use each and how to verify with browser accessibility tools."
image: /logo-og.png
date: 2023-11-09
featured: true
---
# Accessible SVGs

How to help screen readers process your SVG image.

## What is an SVG?

> [Wikipedia](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics):
>
>Scalable Vector Graphics (SVG) is an XML-based vector image format for two-dimensional graphics with support for
>interactivity and animation. The SVG specification is an open standard developed by the World Wide Web Consortium
> (W3C) since 1999.

SVGs allow for creative use of imagery and text which can be dynamic and animated. They are very popular for web pages
which require the use of beautiful imagery to guide the user to certain areas, or direct attention to various elements.

Unfortunately, their use can leave a disabled person unable to read the page or understand where to direct their
attention. With the proper accessibility standards applied, your site can help with screen readers or even basic
navigation for certain individuals.

## Testing accessibility

Of course each browser will  have its own little quirks when rendering and determining accessibility.
For the purpose of this article, I am using Chrome dev tools. You can find its "Accessibility" tab next to the
"Style" tab, and it includes all the details necessary to ensure your HTML element is accessible.

## SVG in an img element

If you are applying an SVG in the form of an image, it's fairly straightforward. Simply supply an `alt` attribute
describing the use of the image:

```html
<img src="https://your.svg" alt="Descriptive text!">
```

## Inline SVG

If your SVG is supplied as an `<svg>` element, it can get a little trickier based on the usage of the SVG.

When the SVG only has a `<text>` element within it, often this static (or dynamic) text can be enough to understand
its purpose:

```html
<svg>
    <text>This is pretty descriptive.</text>
</svg>
```

The Chrome dev tools "Accessibility Tree" will end up looking something like `StaticText "This is pretty descriptive."`.

However, If your SVG includes some imagery along with your text, It can be helpful to include the `role` attribute,
in order for the screen reader to know it is an image with text:

```html
<svg role="img">
    <path d="blahblah.blah"></path>
    <text>This is pretty descriptive.</text>
</svg>
```

If your SVG does *not* have a `<text>` element, we still want to make sure its purpose can be understood by
screen readers. For this we can generally use the `aria-labelledby` attribute along with a `<title>`
and a `<desc>`:

```html
<svg role="img" aria-labelledby="title-1 description-1">
    <title id="title-1">Image with coordinates!</title>
    <desc id="description-1">This is a better description of the image.</desc>
    <path d="blahblah.blah"></path>
    <path d="coo.rdina.tes"></path>
</svg>
```

For this, the Chrome dev tools "Accessibility Tree" will end up seeing something like
`SvgRoot "Image with coordinates! This is a better description of the image."`.

## Conclusion

This is clearly a very high level explanation of how to handle only a couple examples of ways SVGs can be accessible
on the web. There are many other situations to consider for people with disabilities, including never having
excessively flashy animations, or avoiding long-running animations.

I hope this gives some people even the most basic understanding of what might be necessary to make sure your
SVG images are accessible.

To dig deeper, check out the [w3.org html element role mappings](https://www.w3.org/TR/html-aam-1.0/#html-element-role-mappings),
as well as this very informative [article by Carie Fisher](https://www.deque.com/blog/creating-accessible-svgs/).
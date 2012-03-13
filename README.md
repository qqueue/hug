# Free Hugs

Now you can chain any javascript object--even the DOM--which will help take
your mind off the sad state of your social life:

```javascript

var birthday = hug( new Date() )
    .setMonth( 8 )
    .setDate( 15 )
    .it();
    
hug( document.getElementById('blog') )
	.classList()
		.add( 'festive' )
		.add( 'cake' )
	.shrug()
	.style({
		backgroundColor: 'hotPink'
		border: '1px dotted'
	})
	.querySelector( '.updated' ).that()
		.textContent( "just now" )
	.shrug()
	.querySelector( '.content' ).that( function(el) {
		el.textContent = 
			"My birthday is on " + birthday + "." +
			"Will anybody come to my party?";
	});
```

## Installation and Usage

`hug.js` attaches itself as `hug` to the window in browsers, or as 
`exports` in a node.js environment when used with 'require()'.
NPM/AMD-compatible versions incoming, once I figure out how they work.

Usage should be natural if you've ever used jQuery before, though since
the method names are directly from the DOM, keep the
[MDN DOM Reference](https://developer.mozilla.org/en/DOM) open in a new tab
if you're not familar with it.

# Explain further

`Hug()` wraps javascript objects in an object with all the same attributes
as the proxied--or host--object, except the hugged methods instead return the
same Hug instance, allowing you to chain all the regular methods of the proxied
object, just like in jQuery.

Furthermore, attributes that are objects themselves return the hugged attribute,
allowing you to chain further, e.g. the `classList` or `style` attributes of
Element objects. For methods that return something, like `querySelector`, you
can chain the result with `that()`, with optionally takes a function to be 
called instead, if you want to operate on a non-object without breaking the 
chain. `shrug()` returns the parent hugged object; you can use `end()` too,
but it's not as cute.

To get the wrapped object back, use `it()` or `get()`, or even `shrug()` at the
top level of the chain. If your wrapped object already has attributes called
`get`, `shrug`, etc, they will be overwritten, so you can use the
underscore-prefixed versions (`_get()`, `_shrug()`, etc) instead.

There are a few additional features planned or not explained, so stay tuned if
you are interested.

## Why should I use `hug` instead of jQuery for DOM objects?

Because jQuery is too mainstream, man. In seriousness though, you should just 
use jQuery unless you are too hipster for it, since jQuery does a lot more than
just chain DOM objects. Plus, `hug` is slow, since it has to create all the
proxied functions for every new hugged object when called. One advantage over
jQuery is that `hug` exposes you to the actual, wonderful world of W3C-defined
DOM interfaces, so if you're stuck without jQuery, you'll still know how to 
actually do DOM manipulation, at the cost of typing 
overlyVerboseCamelCaseFunctions all the time.

## Why should I use `hug` instead of real javascript Proxy objects?

Only Rhino and Spidermonkey support them by default, and they're, like, so
underground that they're mainstream, you know what I mean, man?

## How does this work?

`Object.getOwnPropertyNames()`, `Object.getPrototypeOf()`, and a healthy dose
of metaprogramming. I'll fill you in on more of the details when I get around
to it. The source is commented however, and it's only 200 lines, so could
read it if you wanted to.

## Now what?

`hug` is just a hobby project, so don't expect too much. I've got plans in my
head for the following additional features though:

1. A generator for huggers for specific classes, to avoid the cost of
   creating all the proxied methods each time a new object is called.
2. Replacer/renamers, so prefixed methods like moz/webkitMatchesSelector will
   be proxied simply as matchesSelector.
3. Custom chained methods (with generators) to add methods not on the 
   original object like `on()` event attachment. Essentially, re-create
   jQuery at runtime, instead of manually-coded.
4. `hug` currently only looks at the first prototype of the object (and the
   object itself) to find attributes to proxy, so objects with long prototype
   chains will be missing proxied methods. Walking all the way up the prototype
   chain is easy, but generates lots of duplicate methods for objects like
   DOM Elements, so to support these I first have to figure out how to filter
   duplicates efficiently.
5. Test suite and npm-compatible version (mostly as an excercise in making
   production-suitable javascript plugins, but also so anybody actually 
   interested in using hug won't have to jump through too many hoops).
6. Some way of wrapping Array/array-like objects to apply proxied
   methods to all objects in the array, for even more jQuery-emulating ability.
   I could call it `group_hug` for even more cuteness.
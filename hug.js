(function() {
"use strict";

/* 
returns a new Hug instance that
wraps object. the public-facing
interface of `hug`.
*/
function hug( object ) {
	return new Hug( object, [] );
}

/*
`hug.blacklist` and `hug.whitelist` are
Arrays of regular expressions that control
which attributes of hugged objects have
generated proxy methods.

The whitelist is processed first, and thus
overrides the blacklist.
*/
hug.blacklist = [
	/^\d+/,
	/^__\w+/,
	/^constructor/ ];
hug.whitelist = [];

/*
`hug.filterer` implements the whitelist and blacklist,
and can thus be overridden to change which methods
are proxied.
*/
hug.filterer = function( attr ) {
	return (
		hug.whitelist.some( function (regex) {
			return regex.test( attr );
		}) ||
		hug.blacklist.every( function (regex) {
			return !regex.test( attr );
		})); 
};

// copies all attributes from extension to object
// implemented in pretty much every library ever
function extend ( object, extensions ) {
	Object.keys( extensions ).forEach( function (key) {
		object[key] = extensions[key];
	});
}

// TODO move methods to Hug's prototype when possible
// to save paltry amounts of memory
function Hug( object, parents ) {
	
	// don't re-hug hugged objects (just in case)
	if ( object instanceof Hug ) { return object; }
	
	var 
		_this = this, // closed over version
		result = null; // defined in this global scope
    
	/*
	`it()` or `get()` returns the hugged object,
	ending the chain.
	*/
	this.get = this.it = this._it = this._get = function() {
			return object;
	};
	
	/*
	`result()` will return the last result of a function
	invocation, ending the chain.
	*/
	this.result = this._result = function () {
		return result;
	};
	
	/*
	`that()` returns either the primitive result directly,
	or the hugged result with a parent reference.
	
	`that(callback)` will call the callback with
	result as it's context and the arguments
	(this, hugged object, parents array)
	*/
	this.that = this._that = function( callback ) {
		if( callback ) {
			callback.call( result, result, object, parents.slice() );
			return this;
		} else if( typeof result === "object" ) {
			return new Hug( result, parents.concat( this ) );
		} else {
			return result;
		}
	};
    
	/*
	`attr(key)` returns the attribute referred to by
	the key, directly, ending the chain.
	
	`attr(key, value)` sets the attribute referred to by
	the key to the value, and continues the chain.
	
	`attr(hash)` copies the hash's attributes to the
	hugged object and continues the chain.
	
	*/
	this.attr = this._attr = function( key, value ) {
		if( value ) {
			object[key] = value;
			return this;
		} else if ( typeof key === "object" ) {
			extend( object, key );
			return this;
		} else {
			return object[key];
		}  
	};
	
	/*
	`shrug()` or `end()` returns the parent hug,
	or if there isn't one, the original hugged object itself.
	*/
	this.shrug = this.end = this._shrug = this._end = function() {
		return parents.pop() || object;
	};
	
	// TODO traverse further in the prototype chain
	/*
	`Object.getOwnPropertyNames()` returns an object's
	attributes, even the non-enumerable ones. It does not
	traverse the prototype chain, however, so the
	object's prototype's OwnPropertyNames() are concatenated
	with the object's own property names.
	*/
	Object.getOwnPropertyNames( object )
	.concat( 
		Object.getOwnPropertyNames(
			Object.getPrototypeOf( object )
		)
	)
	/*
	by default, accept whitelisted attributes
	and remove blacklisted attributes
	*/
	.filter( hug.filterer )
	/*
	Dynamically add proxied methods to the hugger,
	based on the type of the actual attribute
	*/
	.forEach( function (attr) {
		_this[attr] =
			(typeof object[attr] === "function" ) ?
				/*
				`<originalMethod>(arguments)` calls the original method
				with all given arguments and caches the result to be
				used with `that()` or `result()`
				*/
				function() {
					result = object[attr].apply( object, arguments );
					return this;
				}
			/* 
			TODO this also handles null values
			which are also considered objects by typeof,
			which may or may not be desired behavior
			*/
			: ( typeof object[attr] === "object" ) ?
				/*
				`<attribute>()` returns the hugged version
				of object[attribute], for further chaining.
				
				`<attribute>(hash)` copies all attributes from
				hash to object[attribute] and continues the chain.
				
				*/
				function( hash ) {
					if( hash ) {
						extend( object[attr], hash );
						return this;
					} else {
						return new Hug( object[attr], parents.concat( this ) );
					}
				}
			: //else
				/*
				for primitive attributes,
				`<attribute>()` returns that attribute,
				ending the chain.
				
				`<attribute>(value)` sets object[attribute]
				to the new value, and continues the chain.
				
				`<attribute>(function)` sets object[attribute]
				to the return value of the function, called in the
				context of the hugged object, and passed the arguments
				(oldValue, object, parents chain).
				Note that this means if you want to set the attribute
				itself to a function, you'll need to wrap the function
				inside another function, so the outer function will
				'absorb' the call.
				*/
				function( value ) {
					if( value ) {
						object[attr] = 
							typeof value === 'function' ?
								value.call( object, object[attr], object, parents.slice() )
							: //else
								value;
						return this;
					} else {
						return object[attr];
					}
				};
		});
}

/*
export hug for use with node,
or attach it to the global object,
which is `window` for browsers.
*/
if ( this.exports ) {
	this.exports = hug;
} else {
	this.hug = hug;
}

}).call(this);
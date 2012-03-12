function Hug( object, parents ) {
    
    if (!( this instanceof Hug )) {
        return new Hug( object, parents );
    }
    
    if (!( parents )) {
        parents = [];
    }
    
    var _this = this, result = null;
    
    this.get = this.it = this._it = this._get = function() {
        return object;
    };
    
    this.result = this._result = function () {
        return result;
    };
    
    this.that = this._that = function( callback ) {
        if( callback ) {
            callback( result, object, parents.slice() );
            return this;
        } else if( typeof result === "object" ) {
            return new Hug( result, parents.concat( this ) );
        } else {
            return result;
        }
    };
    
    this.attr = this._attr = function( key, value ) {
        if( value ) {
            object[key] = value;
            return this;
        } else {
            return object[key];
        }  
    };
    
    this.shrug = this.end = this._shrug = this._end = function() {
        return parents.pop() || this;
    };

    Object.getOwnPropertyNames( object )
    .concat( 
        Object.getOwnPropertyNames(
            Object.getPrototypeOf( object )
        )
    ).filter( function( attr ) {
        return !( 
            /__\w+__/.test( attr ) ||
            /\d+/.test( attr ) ||
            /constructor/.test( attr ) );
    }).forEach( function( attr ) {
        if( typeof object[attr] === "function" ) {
            _this[attr] = function() {
                result = object[attr].apply( object, arguments );
                return this;
            };
        } else if( typeof object[attr] === "object" ) {
            _this[attr] = function( sets ) {
                if( sets ) {
                    for( var key in sets ) {
                        object[attr][key] = sets[key];
                    }
                    return this;
                } else {
                    return new Hug( object[attr], parents.concat( this ) );
                }
            };
        } else {
            _this[attr] = function( value ) {
                if( value ) {
                    object[attr] = value;
                    return this;
                } else {
                    return object[attr];
                }
            };
        }
    });
}
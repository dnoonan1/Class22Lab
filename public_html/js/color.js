var utils = utils || {};
utils.pad = function(s,p) {
    while (s.length < p) {
        s = '0' + s;
    }
    return s;
};

var ColorSpace = function(luma) {
    this.luma = luma;
    this.isValid = function() {
        return luma(1,0,0) + luma(0,1,0) + luma(0,0,1) === 1;
    }
    if (!this.isValid()) {
        return undefined;
    }
};
ColorSpace.SRGB = new ColorSpace(function(rgb) {
    return 0.21 * rgb.r + 0.72 * rgb.g + 0.07 * rgb.b;
});
ColorSpace.NTSC = new ColorSpace(function(rgb) {
    return 0.3 * rgb.r + 0.59 * rgb.g + 0.11 * rgb.b;
});
ColorSpace.DEFAULT = ColorSpace.SRGB;
ColorSpace.current = ColorSpace.DEFAULT;

var Rgb = function(r,g,b) {
    this.r = r;
    this.g = g;
    this.b = b;
};

Rgb.parse = function(s) {
    s = /(\d|[a-f]){6}/.exec(s.toLowerCase())[0];
    if (s === null) {
        return null;
    }
    var r = parseInt(s.substr(0,2), 16);
    var g = parseInt(s.substr(2,2), 16);
    var b = parseInt(s.substr(4,2), 16);
    return new Rgb(r,g,b);
};

Rgb.fromValue = function(d) {
    var r = Math.floor(d / 0x10000);
    d -= r * 0x10000;
    var g = Math.floor(d / 0x100);
    var b = d - g * 0x100;
    return new Rgb(r,g,b);
};

Rgb.fromHcm = function(h,c,m) {
    var x = c * (1 - Math.abs(h / 60 % 2 - 1));
    var r, g, b;
    r = g = b = 0;
    if (h < 60) {
        r = c; g = x;
    } else if (h < 120) {
        r = x; g = c;
    } else if (h < 180) {
        g = c; b = x;
    } else if (h < 240) {
        g = x; b = c;
    } else if (h < 300) {
        r = x; b = c;
    } else if (h < 360) {
        r = c; b = x;
    }
    return new Rgb(r+m,g+m,b+m);
};

Rgb.prototype = {
    red : function() {
        return this.r;
    },
    green : function() {
        return this.g;
    },
    blue : function() {
        return this.b;
    },
    max : function() {
        return Math.max(this.r,this.g,this.b);
    },
    min : function() {
        return Math.min(this.r,this.g,this.b);
    },
    chroma : function() {
        return this.max() - this.min();
    },
    hue : function() {
        var c = this.chroma();
        var h;
        switch(c) {
            case 0:
                return undefined;
                break;
            case this.r:
                var h = ((this.g - this.b) / c) % 6;
                break;
            case this.g:
                var h = ((this.b - this.r) / c) + 2;
                break;
            case this.b:
                var h = ((this.r - this.g) / c) + 4;
                break;
        }
        return h * 60;
    },
    saturation : function(colorModel) {
        return colorModel.saturation(this);
    },
    lightness : function() {
        return (this.max() + this.min()) / 2;
    },
    value : function() {
        return this.max();
    },
    intensity : function() {
        return (this.r + this.g + this.b) / 3;
    },
    luma : function() {
        return ColorSpace.current.luma(this);
    },
    toRgb : function() {
        return this;
    },
    toHsl : function() {
        return new Hsl(this.hue(), this.saturation(Hsl), this.lightness());
    },
    toHsv : function() {
        return new Hsv(this.hue(), this.saturation(Hsv), this.value());
    },
    add : function(rgb) {
        this.r += rgb.r;
        this.g += rgb.g;
        this.b += rgb.b;
        return this;
    },
    normalize : function() {
        this.r = this.r / 255;
        this.g = this.g / 255;
        this.b = this.b / 255;
    },
    scale : function(k) {
        this.r = this.r * k;
        this.g = this.g * k;
        this.b = this.b * k;
    },
    toHexString : function() {
        var r = utils.pad(Math.round(this.r).toString(16), 2);
        var g = utils.pad(Math.round(this.g).toString(16), 2);
        var b = utils.pad(Math.round(this.b).toString(16), 2);
        return r + g + b;
    }
};

var Hsl = function(h,s,l) {
    this.h = h;
    this.s = s;
    this.l = l;
}; 

Hsl.prototype = {
    min : function() {
        return this.l - this.chroma() / 2;
    },
    chroma : function() {
        return (1 - Math.abs(2 * this.l - 1)) * this.s;;
    },
    hue : function() {
        return this.h;
    },
    saturation : function() {
        return this.s;
    },
    lightness : function() {
        return this.l;
    },
    toRgb : function() {
        return Rgb.fromHcm(this.h, this.chroma(), this.min());
    }
};

Hsl.saturation = function(rgb) {
    var c = rgb.chroma();
    return (c === 0) ? 0 : c / (255 - Math.abs(2 * rgb.lightness() - 255));
};

var Hsv = function(h,s,v) {
    this.h = h;
    this.s = s;
    this.v = v;
};

Hsv.prototype = {
    min : function() {
        return this.v - this.chroma();
    },
    chroma : function() {
        return this.s * this.v;
    },
    hue : function() {
        return this.h;
    },
    saturation : function() {
        return this.s;
    },
    value : function() {
        return this.v;
    },
    toRgb : function() {
        return Rgb.fromHcm(this.h, this.chroma(), this.min());
    }
};

Hsv.saturation = function(rgb) {
    var c = rgb.chroma();
    return (c === 0) ? 0 : c / rgb.value();
};
(function() {
    
    var MIN_SATURATION = 25;
    var MAX_SATURATION = 100;

    var MIN_LIGHTNESS = 25;
    var MAX_LIGHTNESS = 100;
    
    var heading = document.getElementById('heading');

    function randomIntInRange(min, max) {
        return min + Math.floor((max - min + 1) * Math.random());
    }
    
    function randomHslColor() {
        var hue = Math.floor(360 * Math.random());
        var saturation = randomIntInRange(MIN_SATURATION, MAX_SATURATION) / 100;
        var lightness = randomIntInRange(MIN_LIGHTNESS, MAX_LIGHTNESS) / 100;
        return new Hsl(hue, saturation, lightness);
    }
   
    function changeHeadingColor() {
        var hsl;
        do {
            hsl = randomHslColor();
        } while (hsl.lightness() > 0.75);
        var rgb = hsl.toRgb();
        rgb.scale(255);
        var color = '#' + rgb.toHexString();
        heading.style.color = color;
    }
    
    window.onload = function() {
        changeHeadingColor();
        document.getElementById('change').onclick = changeHeadingColor;
        var text = heading.innerHTML;
        var text2 = "";
        var heading2 = document.createElement('h2');
        for (var i = 0; i < text.length; i++) {
            var c = text[i];
            console.log(c);
            text2 += c + '<br>';
        }
        heading2.innerHTML = text2;
        document.body.appendChild(heading2);
    };
    
})();



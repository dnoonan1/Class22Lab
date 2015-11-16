(function() {
    window.onload = function() {
        var length = window.prompt("Enter the rectangle's length.");
        var width = window.prompt("Enter the rectangle's width.");
        var area = length * width;
        document.getElementById('result').innerHTML = 'Area = ' + area;
    };
})();



/*
I want to thank Paul Rudnitskiy for his idea.
If you need full work version you can download it here  https://github.com/BlackStar1991/CardProduct
*/



window.onload = function () {
    // Slider
    var slides = document.getElementsByClassName("sliderBlock_items__itemPhoto");
    var next = document.getElementsByClassName("sliderBlock_controls__arrowForward")[0];
    var previous = document.getElementsByClassName("sliderBlock_controls__arrowBackward")[0];
    var items = document.getElementsByClassName("sliderBlock_positionControls")[0];
    var currentSlideItem = document.getElementsByClassName("sliderBlock_positionControls__paginatorItem");
    var currentSlide = 0;

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function previousSlide() {
        goToSlide(currentSlide - 1);
    }

    function goToSlide(n) {
        if (!slides.length || !items || !items.children.length) {
            return;
        }

        slides[currentSlide].className = 'sliderBlock_items__itemPhoto';
        items.children[currentSlide].className = 'sliderBlock_positionControls__paginatorItem';
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].className = 'sliderBlock_items__itemPhoto sliderBlock_items__showing';
        items.children[currentSlide].className = 'sliderBlock_positionControls__paginatorItem sliderBlock_positionControls__active';
    }

    if (next) {
        next.onclick = nextSlide;
    }
    if (previous) {
        previous.onclick = previousSlide;
    }

    function goToSlideAfterPushTheMiniBlock() {
        for (var i = 0; i < currentSlideItem.length; i++) {
            currentSlideItem[i].onclick = function () {
                var index = Array.prototype.indexOf.call(currentSlideItem, this);
                goToSlide(index);
            };
        }
    }

    goToSlideAfterPushTheMiniBlock();

    if (slides.length > 1) {
        window.setInterval(nextSlide, 5000);
    }

    // Specification and product information
    var buttonFullSpecification = document.getElementsByClassName("block_specification")[0];
    var buttonSpecification = document.getElementsByClassName("block_specification__specificationShow")[0];
    var buttonInformation = document.getElementsByClassName("block_specification__informationShow")[0];
    var blockCharacteristiic = document.querySelector(".block_descriptionCharacteristic");
    var blockDescription = document.querySelector(".block_descriptionInformation");

    if (buttonFullSpecification && buttonSpecification && buttonInformation && blockCharacteristiic && blockDescription) {
        buttonFullSpecification.onclick = function () {
            buttonSpecification.classList.toggle("hide");
            buttonInformation.classList.toggle("hide");
            blockCharacteristiic.classList.toggle("block_descriptionCharacteristic__active");
            blockDescription.classList.toggle("hide");
        };
    }

    // Quantity
    var up = document.getElementsByClassName('block_quantity__up')[0];
    var down = document.getElementsByClassName('block_quantity__down')[0];
    var input = document.getElementsByClassName('block_quantity__number')[0];

    function getValue() {
        var value = Number.parseInt(input.value, 10);
        return Number.isFinite(value) && value >= 1 ? value : 1;
    }

    if (up && down && input) {
        up.onclick = function () {
            input.value = getValue() + 1;
        };
        down.onclick = function () {
            input.value = Math.max(1, getValue() - 1);
        };
        input.onchange = function () {
            input.value = getValue();
        };
    }
};
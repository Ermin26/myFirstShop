const checkBox = document.getElementById('checkBoxes');
const checkboxes = checkBox.querySelectorAll('input[type="checkbox"]');
const variations = document.getElementById('addVariations');
const buttonRow = document.querySelector('.buttonRow');
const addVariations = document.getElementById('add');
const addSizeBtn = document.getElementById('addSize');
buttonRow.style.display = "none";
variations.style.display = "none";
let imgNum = 1;
let fieldNum = 2;

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', () => {
        const check = checkBox.querySelectorAll('input:checked');
        imgNum = 1;
        fieldNum = 2;
        if(check.length == 2) {
            addSizeBtn.style.display = "flex";
            variations.style.display = "flex";
            buttonRow.style.display = "flex";
            addVariations.style.display = "flex";
            variations.innerHTML = "";
            const box = document.createElement("div");
            box.classList.add('sizes',`sizes${imgNum}`);
            box.innerHTML = `<div class="mb-3">
                    <label for="sizes${imgNum}">Size</label>
                    <input type="text" id="sizes${imgNum}" name="sizes${imgNum}" value="" required>
                </div>
                <div class="mb-3">
                    <label for="colors${imgNum}">Color</label>
                    <input type="text" id="colors${imgNum}" name="colors${imgNum}" value="" required>
                </div>
                <div class="mb-3">
                    <label for="image${imgNum}">Image</label>
                    <input type="file" id="image${imgNum}" name="image${imgNum}" multiple required>
                </div>`;
            variations.appendChild(box);
            addVariations.style.display = 'block';
        } else if(check.length == 1) {
            if(check[0].value === "size"){
                addSizeBtn.style.display = "flex";
                buttonRow.style.display = "flex";
                addVariations.style.display = "none";
                variations.style.display = "flex";
                variations.innerHTML = "";
                const box = document.createElement("div");
                box.classList.add('sizes',`sizes${imgNum}`);
                box.innerHTML = `<div class="mb-3">
            <label for="sizes${imgNum}">Size</label>
            <input type="text" id="sizes${imgNum}" name="sizes${imgNum}" value="" required>
                    </div>`;
                variations.appendChild(box);
            }else{
                addSizeBtn.style.display = "none";
                buttonRow.style.display = "flex";
                addVariations.style.display = "flex";
                variations.style.display = "flex";
                variations.innerHTML = "";
                const box = document.createElement("div");
                box.classList.add('sizes',`sizes${imgNum}`);
                box.innerHTML = `<div class="mb-3">
                        <label for="colors${imgNum}">Color</label>
                        <input type="text" id="colors${imgNum}" name="colors${imgNum}" value="" required>
                    </div>
                    <div class="mb-3">
                        <label for="image${imgNum}">Image</label>
                        <input type="file" id="image${imgNum}" name="image${imgNum}" multiple required>
                    </div>
                `;
                variations.appendChild(box);
            }
        } else{
            variations.innerHTML="";
            variations.style.display = "none";
            buttonRow.style.display = "none";
        }
    });
});



function add(){
    const checked = checkBox.querySelectorAll('input:checked');
    if(checked.length == 2){
        const box = document.createElement("div");
            box.classList.add('sizes',`sizes${fieldNum}`);
            box.innerHTML = `<div class="mb-3">
                    <label for="sizes${fieldNum}">Size</label>
                    <input type="text" id="sizes${fieldNum}" name="sizes${fieldNum}" value="" required>
                </div>
                <div class="mb-3">
                    <label for="colors${fieldNum}">Color</label>
                    <input type="text" id="colors${fieldNum}" name="colors${fieldNum}" value="" required>
                </div>
                <div class="mb-3">
                    <label for="image${fieldNum}">Image</label>
                    <input type="file" id="image${fieldNum}" name="image${fieldNum}" multiple required>
                </div>`;
            variations.appendChild(box);
            document.getElementById('add').style.display = 'block';
    }else if(checked.length == 1){
        if(checked[0].value === 'color'){
            const box = document.createElement("div");
            box.classList.add('sizes',`sizes${fieldNum}`);
            box.innerHTML = `<div class="mb-3">
                    <label for="colors${fieldNum}">Color</label>
                    <input type="text" id="colors${fieldNum}" name="colors${fieldNum}" value="" required>
                </div>
                <div class="mb-3">
                    <label for="image${fieldNum}">Image</label>
                    <input type="file" id="image${fieldNum}" name="image${fieldNum}" multiple required>
                </div>`;
                variations.appendChild(box);
        }else{
        }
    }
    fieldNum += 1;
    imgNum += 1;
}

function addSize(){
    const checkbox = document.querySelectorAll('input:checked')
    if(checkbox.length == 2){
        const box = document.createElement("div");
        const colorEle = document.getElementById(`colors${imgNum}`)
        const colorParent = colorEle.parentNode;
        box.classList.add('mb-3')
            box.innerHTML = `
                        <label for="sizes${imgNum}">Size</label>
                        <input type="text" id="sizes${imgNum}" name="sizes${imgNum}" value="" required>`;
            colorParent.parentNode.insertBefore(box, colorParent)
    }else if(checkbox.length == 1) {
        if(checkbox[0].value === 'size'){
            const sizesDiv = document.querySelector(`.sizes${imgNum}`)
            const box = document.createElement("div");
            box.classList.add('mb-3');
                box.innerHTML = `<label for="size${imgNum}">Size</label>
            <input type="text" id="size${imgNum}" name="size${imgNum}" value="" required>`;
                sizesDiv.appendChild(box);
        }else{
        }
        fieldNum++;
    }
}
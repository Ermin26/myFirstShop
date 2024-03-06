function addAdultClothes(infoAdultClothes){
    document.getElementById("adultClothes").classList.add('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("adultClothes").style.display = "flex";
    if(infoAdultClothes.length) {
        for(let i = 0; i < infoAdultClothes.length; i++){
        infoAdultClothes[i].removeAttribute('disabled');
        }
        document.getElementById('addRow').innerHTML="";
    }
}

function addAdultShoes(infoAdultShoes){
    document.getElementById("adultShoes").classList.add('row', 'row-cols-3','row-cols-md-5','d-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("adultShoes").style.display = "flex";
    if( infoAdultShoes.length) {
        for(let i = 0; i < infoAdultShoes.length; i++){
        infoAdultShoes[i].removeAttribute('disabled');
        }
        document.getElementById('addRow').innerHTML="";
    }
};

function addKidsClothes(infoKidsClothes){
    document.getElementById("kidsClothes").classList.add('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4', 'mb-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("kidsClothes").style.display = "flex";
    if(infoKidsClothes.length) {
        for(let i = 0; i < infoKidsClothes.length; i++){
        infoKidsClothes[i].removeAttribute('disabled');
    }
        document.getElementById('addRow').innerHTML="";
    }
};

function addKidsShoes(infoKidsShoes){
    document.getElementById("kidsShoes").classList.add('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("kidsShoes").style.display = "flex";
    if(infoKidsShoes.length) {
        for(let i = 0; i < infoKidsShoes.length; i++){
        infoKidsShoes[i].removeAttribute('disabled');
    }
        document.getElementById('addRow').innerHTML="";
    }

};

function addToysFields(infoToys, toysField){
    toysField.style.display = "flex";
    toysField.classList.add('row', 'row-cols-1', 'row-cols-md-2', 'shadow')
    if (infoToys.length) {
        for(let i = 0; i < infoToys.length; i++){
            infoToys[i].removeAttribute('disabled');
        }
        document.getElementById('addRow').innerHTML="";
    }
};

function removeFields(toysField, infoKidsClothes, infoKidsShoes, infoAdultClothes, infoAdultShoes, infoToys){
    document.getElementById("adultClothes").classList.remove('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("adultClothes").style.display = "none";
    document.getElementById("adultShoes").classList.remove('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("adultShoes").style.display = "none";
    document.getElementById("kidsClothes").classList.remove('row', 'row-cols-3','row-cols-md-6', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("kidsClothes").style.display = "none";
    document.getElementById("kidsShoes").classList.remove('row', 'row-cols-3','row-cols-md-6', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("kidsShoes").style.display = "none";
    /*
    document.getElementById('newCat').value = "NewCat";
    document.getElementById('newCat').text = "NewCat";
    document.getElementById('new').value = "New";
    document.getElementById('new').text = "New";
*/
    toysField.style.display = "none";
    toysField.classList.remove('row', 'row-cols-1', 'row-cols-md-2', 'shadow')

    if (infoKidsClothes.length) {
        for(let i = 0; i < infoKidsClothes.length; i++){
            infoKidsClothes[i].setAttribute('disabled', true);
        }
        document.getElementById('addRow').innerHTML="";
    }
    if (infoKidsShoes.length) {
        for(let i = 0; i < infoKidsShoes.length; i++){
            infoKidsShoes[i].setAttribute('disabled', true);
        }
        document.getElementById('addRow').innerHTML="";
    }
    if (infoToys.length) {
        for(let i = 0; i < infoToys.length; i++){
            infoToys[i].setAttribute('disabled', true);
        }
        document.getElementById('addRow').innerHTML="";
    }
    if(infoAdultClothes.length) {
        for(let i = 0; i < infoAdultClothes.length; i++){
        infoAdultClothes[i].setAttribute('disabled', true);
        }
        document.getElementById('addRow').innerHTML="";
    }
    if(infoAdultShoes.length) {
        for(let i = 0; i < infoAdultShoes.length; i++){
        infoAdultShoes[i].setAttribute('disabled', true);
        }
        document.getElementById('addRow').innerHTML="";
    }
};

function removeFieldsAfterCheckBox(toysField, infoKidsClothes, infoKidsShoes, infoAdultClothes, infoAdultShoes, infoToys){
    document.getElementById("adultClothes").classList.remove('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("adultClothes").style.display = "none";
    document.getElementById("adultShoes").classList.remove('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("adultShoes").style.display = "none";
    document.getElementById("kidsClothes").classList.remove('row', 'row-cols-3','row-cols-md-6', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("kidsClothes").style.display = "none";
    document.getElementById("kidsShoes").classList.remove('row', 'row-cols-3','row-cols-md-6', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto');
    document.getElementById("kidsShoes").style.display = "none";
    toysField.style.display = "none";
    toysField.classList.remove('row', 'row-cols-1', 'row-cols-md-2', 'shadow')

    if (infoKidsClothes.length) {
        for(let i = 0; i < infoKidsClothes.length; i++){
            infoKidsClothes[i].setAttribute('disabled', true);
        }
        document.getElementById('addRow').innerHTML="";
    }
    if (infoKidsShoes.length) {
        for(let i = 0; i < infoKidsShoes.length; i++){
            infoKidsShoes[i].setAttribute('disabled', true);
        }
        document.getElementById('addRow').innerHTML="";
    }
    if (infoToys.length) {
        for(let i = 0; i < infoToys.length; i++){
            infoToys[i].setAttribute('disabled', true);
        }
        document.getElementById('addRow').innerHTML="";
    }
    if(infoAdultClothes.length) {
        for(let i = 0; i < infoAdultClothes.length; i++){
        infoAdultClothes[i].removeAttribute('disabled');
        }
        document.getElementById('addRow').innerHTML="";
    }
    if(infoAdultShoes.length) {
        for(let i = 0; i < infoAdultShoes.length; i++){
        infoAdultShoes[i].setAttribute('disabled', true);
        }
        document.getElementById('addRow').innerHTML="";
    }
};

function showAddButton(){
    const btnDisable = document.getElementById('showAddBtn');
    btnDisable.classList.add('btn-info');
    btnDisable.classList.remove('btn-danger');
    document.getElementById('showAddBtn').style.display = "flex";
};

function hideAddButton(){
    const btnDisable = document.getElementById('showAddBtn');
    btnDisable.classList.add('btn-info');
    btnDisable.classList.remove('btn-danger');
    document.getElementById('showAddBtn').style.display = "none";
};

function addAdultsClothesRow(imageNum){
    const boxWrapper = document.getElementById("addRow");
                        const box = document.createElement("div");
                        box.classList.add('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4','mb-2', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto')
                        box.innerHTML = `<div class="mb-3 group-item d-flex flex-column">
                <label for="num_xs">XS</label>
                <input type="text" id="num_xs" name="size${imageNum}" placeholder="velikost" value="XS" readonly style="display: none;">
                <label for="#xs"></label>
                <input type="number" id="#xs" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_s">S</label>
                <input type="text" id="num_s" name="size${imageNum}" placeholder="velikost" value="M" readonly style="display: none;">
                <label for="#s"></label>
                <input type="number" id="#s" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_M">M</label>
                <input type="text" id="num_M" name="size${imageNum}" placeholder="velikost" value="M" readonly style="display: none;">
                <label for="#M"></label>
                <input type="number" id="#M" name="qty${imageNum}" placeholder="0" value="0" style="display: inline-flex;">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_L">L</label>
                <input type="text" id="num_L" name="size${imageNum}" placeholder="velikost" value="L" readonly style="display: none;">
                <label for="#L"></label>
                <input type="number" id="#L" name="qty${imageNum}" placeholder="0" value="0">
            </div>

            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_XL">XL</label>
                <input type="text" id="num_XL" name="size${imageNum}" placeholder="velikost" value="XL" readonly style="display: none;">
                <label for="#XL"></label>
                <input type="number" id="#XL" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_2XL">2XL</label>
                <input type="text" id="num_2XL" name="size${imageNum}" placeholder="velikost" value="2XL" readonly style="display: none;">
                <label for="#2XL"></label>
                <input type="number" id="#2XL" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_3XL">3XL</label>
                <input type="text" id="num_3XL" name="size${imageNum}" placeholder="velikost" value="3XL" readonly style="display: none;">
                <label for="#3XL"></label>
                <input type="number" id="#3XL" name="qty${imageNum}" placeholder="0" value="0">
            </div>

            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_4XL">4XL</label>
                <input type="text" id="num_4XL" name="size${imageNum}" placeholder="velikost" value="4XL" readonly style="display: none;">
                <label for="#4XL"></label>
                <input type="number" id="#4XL" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_5XL">5XL</label>
                <input type="text" id="num_5XL" name="size${imageNum}" placeholder="velikost" value="5XL" readonly style="display: none;">
                <label for="#5XL"></label>
                <input type="number" id="#5XL" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="color">color</label>
                <input type="text" id="color" name="color[]" placeholder="Barva" value="">
            </div>
            <div class="col-8 col-md-8 mb-2 align-self-center">
                <div class="input-group-sm d-flex mt-3">
                    <label for="formFileMultiple" class="form-label custom-file-label"></label>
                    <input class="form-control text-primary" type="file" id="formFileMultiple" name="image${imageNum}" multiple required>
                    <div class="invalid-feedback">
                        Looks good!
                    </div>
                </div>
            </div>`
                        boxWrapper.appendChild(box);
};

function addAdultsShoesRow(imageNum){
    const boxWrapper = document.getElementById("addRow");
                        const box = document.createElement("div");
                        box.classList.add('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto')
                        box.innerHTML = `<div class="mb-3 group-item d-flex flex-column">
                <label for="num_38">38</label>
                <input type="number" id="num_38" name="size${imageNum}" placeholder="velikost" value="38" readonly style="display: none;">
                <label for="#38"></label>
                <input type="number" id="#38" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_39">39</label>
                <input type="number" id="num_39" name="size${imageNum}" placeholder="velikost" value="39" readonly style="display: none;">
                <label for="#39"></label>
                <input type="number" id="#39" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_40">40</label>
                <input type="number" id="num_40" name="size${imageNum}" placeholder="velikost" value="40" readonly style="display: none;">
                <label for="#40"></label>
                <input type="number" id="#40" name="qty${imageNum}" placeholder="0" value="0" style="display: inline-flex;">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_41">41</label>
                <input type="number" id="num_41" name="size${imageNum}" placeholder="velikost" value="41" readonly style="display: none;">
                <label for="#41"></label>
                <input type="number" id="#41" name="qty${imageNum}" placeholder="0" value="0">
            </div>

            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_42">42</label>
                <input type="number" id="num_42" name="size${imageNum}" placeholder="velikost" value="42" readonly style="display: none;">
                <label for="#42"></label>
                <input type="number" id="#42" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_43">43</label>
                <input type="number" id="num_43" name="size${imageNum}" placeholder="velikost" value="43" readonly style="display: none;">
                <label for="#43"></label>
                <input type="number" id="#43" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_44">44</label>
                <input type="number" id="num_44" name="size${imageNum}" placeholder="velikost" value="44" readonly style="display: none;">
                <label for="#44"></label>
                <input type="number" id="#44" name="qty${imageNum}" placeholder="0" value="0">
            </div>

            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_45">45</label>
                <input type="number" id="num_45" name="size${imageNum}" placeholder="velikost" value="45" readonly style="display: none;">
                <label for="#45"></label>
                <input type="number" id="#45" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_46">46</label>
                <input type="text" id="num_46" name="size${imageNum}" placeholder="velikost" value="46" readonly style="display: none;">
                <label for="#46"></label>
                <input type="number" id="#46" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="color">color</label>
                <input type="text" id="color" name="color[]" placeholder="Barva" required>
            </div>
            <div class="col-8 col-md-8 mb-md-2 align-self-center mt-2 mt-md-0">
                <div class="input-group-sm d-flex">
                    <label for="formFileMultiple" class="form-label custom-file-label"></label>
                    <input class="form-control text-primary" type="file" id="formFileMultiple" name="image${imageNum}" multiple required>
                    <div class="invalid-feedback">
                        Looks good!
                    </div>
                </div>
            </div>`
                        boxWrapper.appendChild(box);
};

function addKidsClothesRows(imageNum){
    const boxWrapper = document.getElementById("addRow");
                        const box = document.createElement("div");
                        box.classList.add('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto')
                        box.innerHTML = `<div class="mb-3 group-item d-flex flex-column">
                <label for="num_56">56</label>
                <input type="number" id="num_56" name="size${imageNum}" placeholder="velikost" value="56" readonly style="display: none;">
                <label for="#56"></label>
                <input type="number" id="#56" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_62">62</label>
                <input type="number" id="num_62" name="size${imageNum}" placeholder="velikost" value="62" readonly style="display: none;">
                <label for="#62"></label>
                <input type="number" id="#62" name="qty${imageNum}" placeholder="0" value="0" style="display: inline-flex;">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_68">68</label>
                <input type="number" id="num_68" name="size${imageNum}" placeholder="velikost" value="68" readonly style="display: none;">
                <label for="#68"></label>
                <input type="number" id="#68" name="qty${imageNum}" placeholder="0" value="0">
            </div>

            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_74">74</label>
                <input type="number" id="num_74" name="size${imageNum}" placeholder="velikost" value="74" readonly style="display: none;">
                <label for="#74"></label>
                <input type="number" id="#74" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_86">86</label>
                <input type="number" id="num_86" name="size${imageNum}" placeholder="velikost" value="86" readonly style="display: none;">
                <label for="#86"></label>
                <input type="number" id="#86" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_92">92</label>
                <input type="number" id="num_92" name="size${imageNum}" placeholder="velikost" value="92" readonly style="display: none;">
                <label for="#92"></label>
                <input type="number" id="#92" name="qty${imageNum}" placeholder="0" value="0">
            </div>

            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_104">104</label>
                <input type="number" id="num_104" name="size${imageNum}" placeholder="velikost" value="104" readonly style="display: none;">
                <label for="#104"></label>
                <input type="number" id="#104" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_104-116">104-116</label>
                <input type="text" id="num_104-116" name="size${imageNum}" placeholder="velikost" value="104-116" readonly style="display: none;">
                <label for="#104-116"></label>
                <input type="number" id="#104-116" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_110">110</label>
                <input type="number" id="num_110" name="size${imageNum}" placeholder="velikost" value="110" readonly style="display: none;">
                <label for="#110"></label>
                <input type="number" id="#110" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_116">116</label>
                <input type="number" id="num_116" name="size${imageNum}" placeholder="velikost" value="116" readonly style="display: none;">
                <label for="#116"></label>
                <input type="number" id="#116" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_128">128</label>
                <input type="number" id="num_128" name="size${imageNum}" placeholder="velikost" value="128" readonly style="display: none;">
                <label for="#128"></label>
                <input type="number" id="#128" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_134">134</label>
                <input type="number" id="num_134" name="size${imageNum}" placeholder="velikost" value="134" readonly style="display: none;">
                <label for="#134"></label>
                <input type="number" id="#134" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_140">140</label>
                <input type="number" id="num_140" name="size${imageNum}" placeholder="velikost" value="140" readonly style="display: none;">
                <label for="#140"></label>
                <input type="number" id="#140" name="qty${imageNum}" placeholder="0" value="0">
            </div>

            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_146">146</label>
                <input type="number" id="num_146" name="size${imageNum}" placeholder="velikost" value="146" readonly style="display: none;">
                <label for="#146"></label>
                <input type="number" id="#146" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_152">152</label>
                <input type="number" id="num_152" name="size${imageNum}" placeholder="velikost" value="152" readonly style="display: none;">
                <label for="#152"></label>
                <input type="number" id="#152" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_158">158</label>
                <input type="number" id="num_158" name="size${imageNum}" placeholder="velikost" value="158" readonly style="display: none;">
                <label for="#158"></label>
                <input type="number" id="#158" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_164">164</label>
                <input type="number" id="num_164" name="size${imageNum}" placeholder="velikost" value="164" readonly style="display: none;">
                <label for="#164"></label>
                <input type="number" id="#164" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_170">170</label>
                <input type="number" id="num_170" name="size${imageNum}" placeholder="velikost" value="170" readonly style="display: none;">
                <label for="#170"></label>
                <input type="number" id="#170" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_176">176</label>
                <input type="number" id="num_176" name="size${imageNum}" placeholder="velikost" value="176" readonly style="display: none;">
                <label for="#176"></label>
                <input type="number" id="#176" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="color">color</label>
                <input type="text" id="color" name="color[]" placeholder="Barva" value="" required>
            </div>
            <div class="col-12 col-md-6 mb-2">
                    <div class="input-group-sm d-flex">
                        <label for="imgField" class="form-label custom-file-label"></label>
                        <input class="form-control text-primary" type="file" id="imgField" name="image${imageNum}" multiple required>
                        <div class="invalid-feedback">
                            Looks good!
                        </div>
                    </div>
                </div>`;
                        boxWrapper.appendChild(box);
};

function addKidsShoesRow(imageNum){
    const boxWrapper = document.getElementById("addRow");
                        const box = document.createElement("div");
                        box.classList.add('row', 'row-cols-3','row-cols-md-5', 'd-flex', 'flex-wrap', 'mt-4', 'text-center', 'border-2', 'border-dark', 'shadow' ,'w-100', 'ms-auto', 'me-auto')
                        box.innerHTML = `<div class="mb-3 group-item d-flex flex-column">
                <label for="num_18">18</label>
                <input type="number" id="num_18" name="size${imageNum}" placeholder="velikost" value="18" readonly style="display: none;">
                <label for="#18"></label>
                <input type="number" id="#18" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_19">19</label>
                <input type="number" id="num_19" name="size${imageNum}" placeholder="velikost" value="19" readonly style="display: none;">
                <label for="#19"></label>
                <input type="number" id="#19" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_20">20</label>
                <input type="number" id="num_20" name="size${imageNum}" placeholder="velikost" value="20" readonly style="display: none;">
                <label for="#20"></label>
                <input type="number" id="#20" name="qty${imageNum}" placeholder="0" value="0" style="display: inline-flex;">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_21">21</label>
                <input type="number" id="num_21" name="size${imageNum}" placeholder="velikost" value="21" readonly style="display: none;">
                <label for="#21"></label>
                <input type="number" id="#21" name="qty${imageNum}" placeholder="0" value="0">
            </div>

            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_22">22</label>
                <input type="number" id="num_22" name="size${imageNum}" placeholder="velikost" value="22" readonly style="display: none;">
                <label for="#22"></label>
                <input type="number" id="#22" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_23">23</label>
                <input type="number" id="num_23" name="size${imageNum}" placeholder="velikost" value="23" readonly style="display: none;">
                <label for="#23"></label>
                <input type="number" id="#23" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_24">24</label>
                <input type="number" id="num_24" name="size${imageNum}" placeholder="velikost" value="24" readonly style="display: none;">
                <label for="#24"></label>
                <input type="number" id="#24" name="qty${imageNum}" placeholder="0" value="0">
            </div>

            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_25">25</label>
                <input type="number" id="num_25" name="size${imageNum}" placeholder="velikost" value="25" readonly style="display: none;">
                <label for="#25"></label>
                <input type="number" id="#25" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_26">26</label>
                <input type="text" id="num_26" name="size${imageNum}" placeholder="velikost" value="26" readonly style="display: none;">
                <label for="#26"></label>
                <input type="number" id="#26" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_27">27</label>
                <input type="number" id="num_27" name="size${imageNum}" placeholder="velikost" value="27" readonly style="display: none;">
                <label for="#27"></label>
                <input type="number" id="#27" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_28">28</label>
                <input type="number" id="num_28" name="size${imageNum}" placeholder="velikost" value="28" readonly style="display: none;">
                <label for="#28"></label>
                <input type="number" id="#28" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_29">29</label>
                <input type="number" id="num_29" name="size${imageNum}" placeholder="velikost" value="29" readonly style="display: none;">
                <label for="#29"></label>
                <input type="number" id="#29" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_30">30</label>
                <input type="number" id="num_30" name="size${imageNum}" placeholder="velikost" value="30" readonly style="display: none;">
                <label for="#30"></label>
                <input type="number" id="#30" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_31">31</label>
                <input type="number" id="num_31" name="size${imageNum}" placeholder="velikost" value="31" readonly style="display: none;">
                <label for="#31"></label>
                <input type="number" id="#31" name="qty${imageNum}" placeholder="0" value="0">
            </div>

            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_32">32</label>
                <input type="number" id="num_32" name="size${imageNum}" placeholder="velikost" value="32" readonly style="display: none;">
                <label for="#32"></label>
                <input type="number" id="#32" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_33">33</label>
                <input type="number" id="num_33" name="size${imageNum}" placeholder="velikost" value="33" readonly style="display: none;">
                <label for="#33"></label>
                <input type="number" id="#33" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_34">34</label>
                <input type="number" id="num_34" name="size${imageNum}" placeholder="velikost" value="34" readonly style="display: none;">
                <label for="#34"></label>
                <input type="number" id="#34" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_35">35</label>
                <input type="number" id="num_35" name="size${imageNum}" placeholder="velikost" value="35" readonly style="display: none;">
                <label for="#35"></label>
                <input type="number" id="#35" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_36">36</label>
                <input type="number" id="num_36" name="size${imageNum}" placeholder="velikost" value="36" readonly style="display: none;">
                <label for="#36"></label>
                <input type="number" id="#36" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="num_37">37</label>
                <input type="number" id="num_37" name="size${imageNum}" placeholder="velikost" value="37" readonly style="display: none;">
                <label for="#37"></label>
                <input type="number" id="#37" name="qty${imageNum}" placeholder="0" value="0">
            </div>
            <div class="mb-3 group-item d-flex flex-column">
                <label for="color">color</label>
                <input type="text" id="color" name="color[]" placeholder="Barva" value="" required>
            </div>
            <div class="col-12 col-md-8 align-self-center mt-1 mb-2 mb-md-0">
                <div class="input-group-sm d-flex mt-1">
                    <label for="imgField" class="form-label custom-file-label"></label>
                    <input class="form-control text-primary" type="file" id="imgField" name="image${imageNum}" multiple required>
                    <div class="invalid-feedback">
                        Looks good!
                    </div>
                </div>
            </div>`
                        boxWrapper.appendChild(box);
};

function addToysRow(imageNum){
    const boxWrapper = document.getElementById("addRow");
                        const box = document.createElement("div");
                        box.classList.add('row', 'row-cols-1', 'row-cols-md-2', 'p-2', 'w-100', 'ms-auto', 'me-auto' ,'shadow',)
                        box.innerHTML = `
            <div id="colorForToys" class="col d-flex flex-column mt-2">
                <input type="text" class="form-control p-3" id="color" name="color[]" placeholder="Barva" value="" required>
            </div>
            <div id="qtyForToys" class="col d-flex flex-column mt-2">
                <input type="number" class="form-control p-3" id="qty1" name="qty1" placeholder="Količina" value="" required>
            </div>
            <div class="col mt-2" id="imgForToys">
                <div class="input-group-sm d-flex align-self-center w-100">
                    <label for="formFileMultiple" class="form-label custom-file-label"></label>
                    <input class="form-control text-primary" type="file" id="formFileMultiple" name="image${imageNum}" multiple required>
                    <div class="invalid-feedback">
                        Looks good!
                    </div>
                </div>
            </div>`;
                        boxWrapper.appendChild(box);
};

function enableMensAndWomens(otrociObutev, otrociPerilo, barve, odrasliObutev, odrasliPerilo){
    otrociObutev.setAttribute('disabled', 'disabled');
    otrociPerilo.setAttribute('disabled', 'disabled');
    barve.setAttribute('disabled', 'disabled');
    document.querySelectorAll('label[for="OtrociObutev"]')[0].style.display = "none";
    document.querySelectorAll('label[for="OtrociPerilo"]')[0].style.display = "none";
    document.querySelectorAll('label[for="OdrasliObutev"]')[0].style.display = "block";
    document.querySelectorAll('label[for="OdrasliPerilo"]')[0].style.display = "block";
    document.querySelectorAll('label[for="barve"]')[0].style.display = "none";
    odrasliPerilo.removeAttribute('disabled');
    odrasliObutev.removeAttribute('disabled');
}
function enableKids(otrociObutev, otrociPerilo, barve, odrasliObutev, odrasliPerilo){
    odrasliPerilo.setAttribute('disabled', 'disabled');
    odrasliObutev.setAttribute('disabled', 'disabled');
    barve.setAttribute('disabled', 'disabled');
    document.querySelectorAll('label[for="OdrasliObutev"]')[0].style.display = "none";
    document.querySelectorAll('label[for="OdrasliPerilo"]')[0].style.display = "none";
    document.querySelectorAll('label[for="OtrociObutev"]')[0].style.display = "block";
    document.querySelectorAll('label[for="OtrociPerilo"]')[0].style.display = "block";
    document.querySelectorAll('label[for="barve"]')[0].style.display = "none";
    otrociObutev.removeAttribute('disabled');
    otrociPerilo.removeAttribute('disabled');
}
function enableNakit(otrociObutev, otrociPerilo, barve, odrasliObutev, odrasliPerilo){
    odrasliPerilo.setAttribute('disabled', 'disabled');
    odrasliObutev.setAttribute('disabled', 'disabled');
    otrociObutev.setAttribute('disabled', 'disabled');
    otrociPerilo.setAttribute('disabled', 'disabled');
    barve.removeAttribute('disabled');
    document.querySelectorAll('label[for="OdrasliPerilo"]')[0].style.display = "none";
    document.querySelectorAll('label[for="OdrasliObutev"]')[0].style.display = "none";
    document.querySelectorAll('label[for="OtrociObutev"]')[0].style.display = "none";
    document.querySelectorAll('label[for="OtrociPerilo"]')[0].style.display = "none";
    document.querySelectorAll('label[for="barve"]')[0].style.display = "block";
}

function resetCheckbox(checkBoxes){
    checkBoxes.forEach(checkbox => {
        checkbox.checked = false;
    });
};

function addFieldSizes(imageNum){
    if(imageNum == 10){
        const btnDisable = document.getElementById('showAddBtn');
        btnDisable.classList.remove('btn-info');
        btnDisable.classList.add('btn-danger');
    }

    if(imageNum == 11){
        const btnDisable = document.getElementById('showAddBtn');
        btnDisable.removeAttribute('onclick');
        window.alert("Maximalan broj varijacija je 10!")
    }
    
    else{
        if(cate == 'Kids'){
            if (checkSub.includes(subCat) && subCat !== 'Shoes' && subCat !== 'Toys') {
                addKidsClothesRows(imageNum);
            }
            else if(subCategory == 'Shoes'){
                addKidsShoesRow(imageNum);
            }
            else if(subCategory == 'Toys'){
                addToysRow(imageNum);
            }
            else if(newCategory == 'Otroci perilo'){
                addKidsClothesRows(imageNum);
            }
            else if(newCategory == 'Otroci obutev'){
                addKidsShoesRow(imageNum);
            }
            else if(newCategory == 'Barve'){
                addToysRow(imageNum);
            }
        }
        else if(cate == 'Mens' || cate == 'Womens'){
            if(checkSub.includes(subCat) && subCat !== 'Shoes'){
                addAdultsClothesRow(imageNum);
            }
            else if(subCat == 'Shoes'){
                addAdultsShoesRow(imageNum);
            }
            else if(newCategory == 'Odrasli perilo'){
                addAdultsClothesRow(imageNum);
            }
            else if(newCategory == 'Odrasli obutev'){
                addAdultsShoesRow(imageNum);
            }
        }
        else if(cate == 'Jewerly'){
                addToysRow(imageNum);
        }
        else{
            if(newCategory == 'Odrasli perilo'){
                addAdultsClothesRow(imageNum);
            }
            else if(newCategory == 'Odrasli obutev'){
                addAdultsShoesRow(imageNum);
            }
            else if(newCategory == 'Otroci perilo'){
                addKidsClothesRows(imageNum);
            }
            else if(newCategory == 'Otroci obutev'){
                addKidsShoesRow(imageNum);
            }
            else if(newCategory == 'Barve'){
                addToysRow(imageNum);
            }
        }
    }
};
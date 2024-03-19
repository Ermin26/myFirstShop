const forms = document.querySelectorAll('.qtyForm');

let sku;
let operator;
let parentDiv;

forms.forEach(form =>{
    const inputs = form.querySelectorAll('input[type="submit"]');
    inputs.forEach(input =>{
        input.addEventListener('click', async(event)=>{
            event.preventDefault();
            sku = event.target.id;
            operator = event.target.name;
        try{
            const editQty = document.getElementById(`${sku}`);
            parentDiv = editQty;
            const checkQty = editQty.querySelector('#qty');
            if(operator === 'minus'){
                if(checkQty.value === '1'){
                    window.alert('Quantity must be greater than 1!')
                }else{
                    await updateQuantity();
                }
            }else if(operator === 'plus'){
                if(checkQty.value === checkQty.max){
                    window.alert(`Maximum qty for this product is ${checkQty.max}`)
                }else{
                    await updateQuantity();
                }
            }
        }
        catch(e){
            console.log('Error', e);
        }
        })
    });
});


async function updateQuantity(){
    const response = await fetch('/edit_qty',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            id: sku,
            operator: operator
            })
        });

        if(!response.ok){
            throw new Error("Something went wrong.");
        }
        const data = await response.json();
        data.forEach(item =>{
            if(item.sku === sku){
                const qtyInput = parentDiv.querySelector('#qty')
                qtyInput.value = item.qty
                const updateTotal = document.querySelector(`[data-sku="${sku}"]`)
                let totalPrice = parseFloat(item.price) * item.qty;
                updateTotal.innerText = totalPrice.toFixed(2) + ' ' + '€';
            }
        })
        updateTotal();
}


async function updateTotal(){
    const prices = document.querySelectorAll('.pricePerProduct');
    let total = 0;
    prices.forEach(price =>{
        let productPrice = price.innerText.split(' ')[0];
        total += parseFloat(productPrice);
    });
    document.getElementById('netoPrice').innerText = total + " " + '€';
}

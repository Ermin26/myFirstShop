const forms = document.querySelectorAll('.qtyForm');
//const inputs = forms.querySelectorAll('input[type= "submit"]');

let sku;
let operator;
let parentDiv;

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

                console.log("This is total: ", document.getElementById('netoPrice').innerText);
            }
        })
}

forms.forEach(form =>{
    const inputs = form.querySelectorAll('input[type="submit"]');
    inputs.forEach(input =>{
        input.addEventListener('click', async(event)=>{
            event.preventDefault();
            console.log("This is event target",event.target.id);
            sku = event.target.id;
            operator = event.target.name;
        try{
            const editQty = document.getElementById(`${sku}`);
            parentDiv = editQty;
            const checkQty = editQty.querySelector('#qty');
            if(operator === 'minus'){
                if(checkQty.value === '1'){
                    window.alert('Quantity must be greate than 1!')
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
            console.log('Error', e.message);
        }
        })
    });
});
/*
    inputs.forEach(input =>{
    input.addEventListener('click', async(event)=>{
        event.preventDefault();
        console.log("This is target",event.target.id, event.target.name);
        sku = event.target.id;
        operator = event.target.name;
        try{
            const editQty = document.getElementById(`${event.target.id}`);
            parentDiv = editQty;
            const checkQty = editQty.querySelector('#qty');
            if(operator === 'minus'){
                if(checkQty.value === '1'){
                    window.alert('Quantity must be greate than 1!')
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
            console.log('Error', e.message);
        }
    });
    })
*/
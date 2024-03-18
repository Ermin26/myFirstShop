const form = document.querySelector('.qtyForm');
const inputs = form.querySelectorAll('input[type= "submit"]');


/*
inputs.forEach(input =>{
    input.addEventListener('click', async(event)=>{
        event.preventDefault();
        console.log("This is target",event.target.id, event.target.name);
        try{
            const response = await fetch('/edit_qty',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: event.target.id,
                operator: event.target.name
                })
            });

            if(!response.ok){
                throw new Error("Something went wrong.");
            }
            const data = await response.json();
            data.forEach(item =>{
                if(item.sku === event.target.id){
                    const editQty = document.getElementById(`${item.sku}`);
                    const qtyInput = editQty.querySelector('#qty')
                    qtyInput.value = item.qty

                }
            })
        }
        catch(e){
            console.log('Error', e.message);
        }
    });
})
*/
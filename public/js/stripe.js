addEventListener('DOMContentLoaded',async()=>{
            
    //const stripe = Stripe('pk_live_51MdvPOHAKJ9ybQgY3lEYJQ1TxLDsLlBVnPJestkYEqooVkmGw1pbatap5URKu7pN5T4RqAYotFAcWYdP9luqxwjY00Ky97oD6B');
    const {publishableKey} = await fetch('/config').then((r) => r.json());
    const stripe = Stripe(publishableKey);
    const apiKey = publishableKey;
    // const clientSecret = <= clientSecret %>
     
     const {
     error: backendError,
     clientSecret
    } = await fetch('/fetchOrder').then(r => r.json());
    if (backendError) {
        console.log("this is fucking error",backendError);
    }
    console.log(`Client secret returned.`);

    const appearance = {
        theme: 'night',
        labels: 'floating',
        /*
                variables: {
fontFamily: 'Sohne, system-ui, sans-serif',
fontWeightNormal: '500',
borderRadius: '8px',
colorBackground: '#0A2540',
colorPrimary: 'white',
colorPrimaryText: 'white',
colorText: 'white',
colorTextSecondary: 'white',
colorTextPlaceholder: '#3f403f',
colorIconTab: 'dark',
colorLogo: 'dark'
},
                rules: {
                    '.Tab': {
                      border: '2px solid var(--colorTextPlaceholder)',
                      boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)',
                    },

                    '.Tab:hover': {
                     color: 'var(--colorText)',
                     background: 'var(--colorTextPlaceholder)'
                    },

                    '.Tab--selected': {
                     borderColor: '#e81510',
                     boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02), 0 0 0 2px var(--colorPrimary)',
                    },
                
                    '.Input--invalid': {
                      boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.07), 0 0 0 2px var(--colorDanger)',
                    },
                    '.Checkbox--checked': {
                        display: 'none'
                    },
                    '.CheckboxInput--checked': {
                        display: 'none'
                    },
                    '.CheckboxLabel--checked':{
                        display: 'none'
                    }
                   

// See all supported class names and selector syntax below
                    },
                */
                };
           
        const options = {
        mode :'shipping', 
        allowedCountries:['SI','AT','BG','HR', 'HU', 'RO','SK'],
        fields:{
            phone: 'always',
        },
    }    

     // Pass the appearance object to the Elements instance
     const elements = stripe.elements({clientSecret, appearance});

    // Create a card element and mount it to the card element container
        const addressElement = elements.create("address", options);
        addressElement.mount("#address-element");
        const paymentElement = elements.create('payment',{
            paymentMethodOrder:['card', 'paypal', 'apple_pay', 'google_pay']
        });
        paymentElement.mount('#payment-element');
        const linkAuthenticationElement = elements.create("linkAuthentication");
        linkAuthenticationElement.mount("#link-authentication-element");
       
        let paymentMethod =[];

        paymentElement.on('change', function(event){
            paymentMethod.pop();
            paymentMethod.push(event.value.type);
            console.log(paymentMethod)
        })

        let addressData = {};
            
        addressElement.on('change', function(event) {
            if (event.complete) {
                    // extract potentially complete address
                    addressData = event.value;
                }
            });
        let emailData = [];
        
        linkAuthenticationElement.on('change', function(event) {
                if(event.complete){
                    emailData.pop();
                    emailData.push(event.value.email);
                }
            })

            const form = document.getElementById('payment-form');
                form.addEventListener('submit', async (event) => {
                    event.preventDefault();
                // Disable the submit button to prevent multiple clicks
                document.getElementById('submit-button').disabled = true;
                const billingDetails = {
                    name: addressData.name,
                    email: emailData[0],
                    address: {
                        line1: addressData.address.line1,
                        country: addressData.address.country,
                        city: addressData.address.city,
                        postal_code: addressData.address.postal_code,
                    },
                    phone: addressData.phone,
                };
/*
                try{
                    // Create a payment intent on the server    	
                    const response = await fetch('/placeOrder', {
                         method: 'POST',
                         headers: {
                             Authorization: `Bearer ${apiKey}`,
                             'Content-Type': 'application/json',
                         },
                         body: JSON.stringify({
                             payment_Method: paymentMethod[0],
                             billing_details: billingDetails,
                         }),
                    });

                    if (response.ok) {
                    const data = await response.json();
                    const {clientSecret} = data;
                    console.log("Data: ",data);
                    } else {
                        console.error('Error placing order'); // Handle the error case
                        }
                } catch(e){

                }
                */
                    elements.submit();
                    if (paymentMethod[0] === 'card') {
                    
                        const result = await stripe.confirmPayment({
                            clientSecret,
                            elements,
                                      
                            confirmParams: {
                                return_url: 'http://localhost:5000/',
                            },
                            billing_details: {
                                name: billingDetails.name,
                                email : billingDetails.email ,
                                address:{
                                    line1: billingDetails.address.line1,
                                    country: billingDetails.address.country,
                                    city: billingDetails.address.city,
                                    postal_code: billingDetails.address.postal_code
                                },
                                phone: billingDetails.phone
                            },
                        });
                        console.log("yupiiii")
                        console.log("result: ", result)
                        if (result.error) {
                                // Display an error message to the user
                                console.log("This is your error",result.error.message);
                                window.alert("This is your error",result.error.message);
                                
                        } 
                        else {
                                window.alert("This is your order");
                    
                        };
                    } else if (paymentMethod[0] === 'paypal') {
                        stripe.confirmPayPalPayment(clientSecret, {
                        // Return URL where the customer should be redirected after
                        // the authorization.
                        return_url: "http://localhost:5000/",
                        })
                        .then(function(result) {
                          if (result.error) {
                            // Inform the customer that there was an error.
                          console.log("result error js code",result.error)
                            }
                            window.alert("Successfully ordered")
                        });
                    }
                    
                });
});
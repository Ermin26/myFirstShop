document.getElementById('payButton').disabled = true;
        addEventListener('DOMContentLoaded',async()=>{
            const {publishableKey, SERVER_URL, user_id} = await fetch('/config').then((r) => r.json());
            const stripe = Stripe(publishableKey);
            const apiKey = publishableKey;

            const {error: backendError,clientSecret} = await fetch('/fetchOrder').then(r => r.json());
            if (backendError) {
                console.log("Error: ",backendError);
            }

            const appearance = {
                theme: 'flat',
                labels: 'floating',
            };
                const options = {
                mode :'shipping',
                allowedCountries:['SI'/*,'AT','BG','HR', 'HU', 'RO','SK'*/],
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
                    paymentMethodOrder:['card', 'paypal'],

                });
                paymentElement.mount('#payment-element');
                const linkAuthenticationElement = elements.create("linkAuthentication");
                linkAuthenticationElement.mount("#link-authentication-element");

                let paymentMethod =[];

                paymentElement.on('change', function(event){
                    paymentMethod.pop();
                    paymentMethod.push(event.value.type);

                })

                let addressData = {};
                let emailData = [];

                addressElement.on('change', function(event) {
                    if (event.complete) {
                            // extract potentially complete address
                            addressData = event.value;
                            if(addressData && emailData.length){
                                document.getElementById('payButton').removeAttribute('disabled');
                            }
                        }
                    });
                linkAuthenticationElement.on('change', function(event) {
                        if(event.complete){
                            emailData.pop();
                            emailData.push(event.value.email);
                            if(addressData && emailData.length){
                                document.getElementById('payButton').removeAttribute('disabled');
                            }
                        }
                    })

                    const form = document.getElementById('paymentForm');
                        form.addEventListener('submit', async (event) => {
                            event.preventDefault();
                        // Disable the submit button to prevent multiple clicks
                        document.getElementById('payButton').disabled = true;
                        if(addressData.name && addressData.address.line1 && addressData.address.country && addressData.address.city && addressData.address.postal_code && addressData.phone && emailData.length){
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
                            elements.submit();
                             const result = await stripe.confirmPayment({
                                        clientSecret,
                                        elements,
                                        confirmParams: {
                                            return_url: `${SERVER_URL}/payment`,
                                            },
                                         // redirect: 'if_required',
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
                                        metadata: {
                                            user_id: user_id,
                                        },
                                        receipt_email: billingDetails.email,
                                        payment_method_data: {
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
                                        }
                                    });
                                   if(result.error){
                                    console.log(result.error);
                                   // window.alert(result.error.message); make modal for this
                                    document.getElementById('payButton').disabled = false;
                                   // window.location.reload();
                                   }
                                }else{
                                    window.alert('Polja za naslov dostave so obvezna')
                                    window.location.reload();
                                }

                            });
        });
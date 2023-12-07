# Salestershop

## Website Link
[https://salestershop.onrender.com/](https://salestershop.onrender.com/)

## Brief Description
Welcome to our Salestershop website, where you can experience a unique shopping journey. We proudly present a diverse range of high-quality products. With a simple and user-friendly interface, you can easily browse products, add them to your cart, and securely make a purchase.

Our goal is customer satisfaction, so we provide fast and reliable service.

## Functionalities
   - Overview of a diverse range of products.
   - Easy addition of products to the shopping cart.
   - Safe and efficient execution of purchases.
   - Efficient search for products based on your preferences.

   ~~ Overview of past purchases and transaction history. ~~

## Technologies
- HTML
- CSS
- Bootstrap
- JavaScript
- Node.js
- Express
- Nodemailer
- Dotenv
- Flash
- ejs-mate
- bcrypt
- layouts
- multer
- Method-override
- Passport
- Stripe
- PostgreSQL

## Database
I used PostgreSQL for the database, currently utilizing 6 databases.

### 1. inventory
   Stores all product data.
   
   - Data stored include:
     - id
     - Product name
     - Net price
     - Short info
     - Full info
     - Category
     - Subcategory
     - Links (imgs)
     - Date of addition
     - Inventory SKU

### 2. Variations

   Stores data related to variations.
   
   - Data stored include:
     - Product id (inventory id)
     - Size
     - Color
     - Img link (link to the image based on color)
     - SKU (variation number)
     - Quantity

### 3. Orders
   Stores data of individuals and products after placing an order.
   
   - Data stored include:
     - Order number
     - Invoice number
     - Buyer's name
     - Email
     - Country
     - City
     - Postal code
     - Street
     - Contact
     - Product ids (array)
     - Product quantities (array)
     - Invoice amount
     - Order placement date
     - Shipped (boolean, default - false)

### 4. Invoices
   Stores all data when adding a new invoice.
   
   - Data stored include:
     - Invoice number
     - Order number
     - Ordered products (array)
     - Invoice amount
     - Date of invoice issuance

### 5. Deleted
   Stores products that are sold out. Once the last product is sold, the inventory and variation data are deleted, and the information is saved in this database.
   
   - Data stored include:
     - SKU
     - Product name
     - Net price
     - Info
     - Full info
     - Category
     - Subcategory
     - Img links

### 6. Session
   - Session data when a user logs in to the website.

## Author
   Ermin Joldić

## Contact
- Ermin Joldić
- +38640415987
- erminjoldic26@gmail.com

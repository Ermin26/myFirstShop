# Salestershop

### https://salestershop.onrender.com/

## Kratek opis

Dobrodošli na naši spletni strani Salestershop, kjer vas čaka edinstveno nakupovalno doživetje. S ponosom vam predstavljamo pestro ponudbo kakovostnih izdelkov. 
S preprostim in uporabniku prijaznim vmesnikom lahko enostavno brskate po izdelkih, dodajate jih v košarico ter varno opravite nakup. 

Naš cilj je zadovoljstvo strank, zato vam nudimo hitro in zanesljivo storitev.

## Funkcionalnosti

- Pregled raznolike ponudbe izdelkov.
- Enostavno dodajanje izdelkov v košarico.
- Varno in učinkovito izvedbo nakupa.
- ~~ Pregled preteklih nakupov in zgodovina transakcij.
- Učinkovito iskanje izdelkov glede na vaše želje


## Tehnologije

* HTML
* CSS
* Bootstrap   
* JavaScript 
* Node.js
* Express 
* Nodemailer 
* Dotenv 
* Flash
* ejs-mate
* bcrypt
* layouts
* multer
* Method-override 
* Passport
* Stripe
* PostgreSQL
    

## Baza podatkov

    Za bazo podatkov sem uporabljal PostgreSql. Število baz ki jih trenutno uporabljam je 7.
    Baze podatkov ki jih uporabljam:

1. inventory - V bazo podatkov se shranjujejo vsi produkti..
   - Podatki ki se shranjujejo v bazo so:
     - id
     - Ime produkta,
     - neto cena,
     - Kratek info;
     - Celotni info,
     - Kategorija,
     - Podkategorija,
     - povezave ( imgs ),
     - datum dodava;

2. Varijacije - Shranjevanje podatkov glede na varijacije.
   - Podatki ki se shranjujejo so:
     - product id == inventory id
     - velikost,
     - barva
     - img link ( povezava do slike glede na barvo)
     - sku - številka  varijacije,
     - količina,
                 
3. Orders - V to bazo so shranjeni podatki oseb in produktov po oddanem naročilu.
   - Podatki ki se shranjujejo so:
     - številka naročila,
     - številka računa,
     - Ime kupca;
     - e-mail,
     - Država,
     - Mesto,
     - Poštna številka
     - Ulica,
     - Kontakt,
     - product ids ( array ),
     - product qtys ( array ),
     - znesek računa,
     - datum odaje naročila
     - poslano ( boolean, default - false )

4. Računi - V to bazo so shranjeni vsi podatki kadar se doda novi račun.
   - Podatki ki se shranjujejo so:
     - številka računa,
     - številka naročila,
     - naročeni producti ( array ),
     - znesek računa,
     - Datum izdaje računa;

5. Deleted - V to bazo so shranjeni produkti ki so rasprodani. Takoj ko se zadnji produkt proda funkcija za preverjanje zaloge
                izbriše product iz "invetory" in "varijacije" ter podatke shrani v to bazo.
   
             - Podatki ki se shranjujejo so:
               - sku,
               - ime produkta,
               - neto cena,
               - info,
               - celotni info,
               - Kategorija,
               - Podkategorija
               - imgs ( povezave )
                        

## Session - session podatki kadar se korisnik prijavi na spletno stran.


## Avtor
  ### Ermin Joldić


## Kontakt
  * Ermin Joldić,
  * +38640415987
  * erminjoldic26@gmail.com




     


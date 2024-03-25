const { render } = require('ejs');
const express = require('express');
const router = express.Router();



router.get('/',async (req,res) => {
    res.render('admin/admin.ejs')
})

router.get('/products', async (req, res) => {
    res.render('admin/products')
});

router.get('/products/add', async (req, res) => {
    res.render('admin/addProduct')
});

router.get('/products/edit', async (req, res) => {
    res.render('admin/editProduct')
});

router.get('/orders', async (req, res) => {
    res.render('admin/orders')
});

router.get('/orders/sended', async (req, res) => {
    res.render('admin/sended')
});

router.get('/orders/notsended', async (req, res) => {
    res.render('admin/notsended')
});

router.get('/users', async (req, res) => {
    res.render('admin/users')
});

router.get('/users/add', async (req, res) => {
    res.render('admin/addUser')
});

router.get('/users/edit', async (req, res) => {
    res.render('admin/editUser')
});


module.exports = router;
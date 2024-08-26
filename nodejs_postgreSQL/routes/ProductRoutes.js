const router =require('express').Router()
const ProductController = require('../controller/ProductController')
router.get('/product',ProductController.getAllProduct)
router.get('/product/:id',ProductController.getProductById)
router.get('/product/category/:categoryId',ProductController.getProductsByCategoryId)
router.post('/product',ProductController.createProduct)
router.put('/product/:id',ProductController.updateProduct)
router.delete('/product/:id',ProductController.deleteProduct)

module.exports =router
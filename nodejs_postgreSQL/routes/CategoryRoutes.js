const router =require('express').Router()
const CategoryController = require('../controller/CategoryController')

router.get('/category',CategoryController.getAllCategory)
router.post('/category',CategoryController.createCategory)
router.put('/category/:id',CategoryController.updateCategory)
router.delete('/category/:id',CategoryController.deleteCategory)

module.exports =router
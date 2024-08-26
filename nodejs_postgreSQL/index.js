const express = require('express')
const db = require('./services/db')
const port= 1024
const app =express()


app.use(express.json())
app.use(require('./routes/CategoryRoutes'))
app.use(require('./routes/ProductRoutes'))


app.listen(port,()=>console.log(`server berjalan di PORT :${port}`))
const { Pool } = require('pg')

const pool =new Pool({
    connectionString:'postgres://tleqnqng:p7kBiwrNv5FuaCFxiSAWVSXnepaFUXV1@rosie.db.elephantsql.com/tleqnqng'
})
module.exports ={
    pool
}
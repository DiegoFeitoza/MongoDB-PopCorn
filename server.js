const express = require('express');
const app = express();
const axios = require('axios')

const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

var db;

MongoClient.connect("mongodb://localhost:27017",{ useNewUrlParser: true }, (err, client) => {  
    if(err) return console.log(err);
    db = client.db('popapi');
    carregaFilmes();
    carregaSeries();
    app.listen(3000, () => {        
        console.log('Rodando o express na porta 3000')
    })
})

const carregaFilmes = () => {
    axios.get("https://tv-v2.api-fetch.website/movies/")
        .then(function(response){
            db.collection('filmes').drop(function(err, result){
                //if (err) return console.log(err);
                console.log("Collection deleted");
            });
            response.data.map(filmes => {
                let pg = filmes.split('/')[1];
                axios.get(`https://tv-v2.api-fetch.website/movies/${pg}`).then(function(resp){
                    resp.data.map(filme => {                        
                        db.collection('filmes').insertOne(filme, (err, result) => {
                            if(err) return console.log(err);
                        })
                    });
                })                
            })      
        })
        .catch(function(response){
            console.log(response)
        })   
}

const carregaSeries = () => {
    db.collection('series').drop(function(err, result){
        //if (err) return console.log(err);
        console.log("Collection deleted");
    });
    axios.get("https://tv-v2.api-fetch.website/shows/")
    .then(function(response){        
        response.data.map(series => {
            let pg = series.split('/')[1];
            axios.get(`https://tv-v2.api-fetch.website/shows/${pg}`)
            .then(function(resp){
                resp.data.map(serie => {
                    axios.get(`https://tv-v2.api-fetch.website/show/${serie._id}`)
                    .then((response) => {
                        db.collection('series').insertOne(response.data, (err,result) => {
                            console.log(result)
                        })
                    })
                    .catch((response) => {
                        //console.log(response.data)
                    })                        
                    
                }); 
            })                
        })             
    })
    .catch(function(response){
        console.log('Erro AXIOS: ',response)
    })
          
}

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept')
    next()
});

//Get inicial do arquivo
app.get('/filmes', function(req, res){
    db.collection('filmes').find({}).toArray((err, docs) => {
        res.send(docs)
    }) 
})

//Get inicial do arquivo
app.get('/series', function(req, res){
    db.collection('series').find({}).toArray((err, docs) => {
        res.send(docs)
    }) 
})
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override'); // Importação do method-override
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const uri = 'mongodb+srv://<user>:<password>@cadfunc.yrw1k.mongodb.net/?retryWrites=true&w=majority&appName=CadFunc';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method')); // Configuração do method-override
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let db;

MongoClient.connect(uri)
  .then(client => {
    db = client.db('CadFunc');
    app.listen(3000, () => {
      console.log('Escutando na porta 3000');
    });
  })
  .catch(err => console.log(err));

// Página de Listagem
app.get('/', (req, res) => {
  db.collection('registrations').find().toArray()
    .then(results => {
      res.render('index.ejs', { registrations: results });
    })
    .catch(err => {
      console.log(err);
    });
});

// Página de Criação
app.get('/create', (req, res) => {
  res.render('create.ejs');
});

app.post('/register', (req, res) => {
  db.collection('registrations').insertOne(req.body)
    .then(result => {
      console.log('Salvo no banco de dados');
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
});

// Página de Edição
app.get('/edit/:id', (req, res) => {
  const id = new ObjectId(req.params.id);
  db.collection('registrations').findOne({ _id: id })
    .then(result => {
      res.render('edit.ejs', { registration: result });
    })
    .catch(err => {
      console.log(err);
    });
});

// Atualização de Registro usando PUT
app.put('/update/:id', (req, res) => {
  const id = new ObjectId(req.params.id);
  db.collection('registrations').updateOne({ _id: id }, { $set: req.body })
    .then(result => {
      console.log('Atualizado no banco de dados');
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
});

// Página de Exclusão
app.get('/delete/:id', (req, res) => {
  const id = new ObjectId(req.params.id);
  db.collection('registrations').findOne({ _id: id })
    .then(result => {
      res.render('delete.ejs', { registration: result });
    })
    .catch(err => {
      console.log(err);
    });
});

// Exclusão de Registro usando DELETE
app.delete('/delete/:id', (req, res) => {
  const id = new ObjectId(req.params.id);
  db.collection('registrations').deleteOne({ _id: id })
    .then(result => {
      console.log('Excluído do banco de dados');
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
});

// Busca por nome usando GET
app.get('/search', (req, res) => {
  const nome = req.query.nome;
  db.collection('registrations').findOne({ nome: nome })
    .then(result => {
      if (result) {
        res.render('get.ejs', { registration: result });
      } else {
        res.status(404).send('Funcionário não encontrado');
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Erro no servidor');
    });
});

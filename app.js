const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb'); // Adicionada a importação do ObjectId
const path = require('path');
const uri = 'mongodb+srv://<user>:<password>@cadfunc.yrw1k.mongodb.net/?retryWrites=true&w=majority&appName=CadFunc';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Configuração do caminho das views

let db;

MongoClient.connect(uri)
  .then(client => {
    db = client.db('CadFunc');
    app.listen(3000, () => {
      console.log('Escutando na porta 3000');
    });
  })
  .catch(err => console.log(err));

// Read - Página de Listagem
app.get('/', (req, res) => {
  db.collection('registrations').find().toArray()
    .then(results => {
      res.render('index.ejs', { registrations: results });
    })
    .catch(err => {
      console.log(err);
    });
});

// Create - Página de Criação
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

// Update - Página de Edição
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

app.post('/update/:id', (req, res) => {
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

// Delete - Página de Exclusão
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

app.post('/delete/:id', (req, res) => {
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

// Rota para buscar um funcionário específico pelo nome
app.post('/search', (req, res) => {
  const nome = req.body.nome;
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

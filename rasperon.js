const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const { mongoUrl } = require('./config.json')

// MongoDB'ye bağlan
mongoose.connect('mongoUrl', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// MongoDB Şema ve Model Tanımlama
const KazancSchema = new mongoose.Schema({
    miktar: Number
});

const NotSchema = new mongoose.Schema({
    metin: String
});

const Kazanc = mongoose.model('Kazanc', KazancSchema);
const Not = mongoose.model('Not', NotSchema);

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Ana Sayfa
app.get('/', async (req, res) => {
    try {
        const kazanc = await Kazanc.findOne();
        const notlar = await Not.find();
        res.render('index', { kazanc: kazanc ? kazanc.miktar : 0, notlar });
    } catch (err) {
        console.error(err);
        res.status(500).send('Bir hata oluştu');
    }
});

// Kazancı Güncelleme
app.post('/guncelle', async (req, res) => {
    try {
        const { miktar } = req.body;
        let kazanc = await Kazanc.findOne();
        if (!kazanc) {
            kazanc = new Kazanc({ miktar });
        } else {
            kazanc.miktar += parseInt(miktar);
        }
        await kazanc.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Bir hata oluştu');
    }
});

// Not Ekleme
app.post('/notekle', async (req, res) => {
    try {
        const { metin } = req.body;
        const yeniNot = new Not({ metin });
        await yeniNot.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Bir hata oluştu');
    }
});

// Notlar Sayfası
app.get('/notlar', async (req, res) => {
    try {
        const notlar = await Not.find();
        res.render('notlar', { notlar });
    } catch (err) {
        console.error(err);
        res.status(500).send('Bir hata oluştu');
    }
});


// Sunucuyu Başlatma
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda başlatıldı`));

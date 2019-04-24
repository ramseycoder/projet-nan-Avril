const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const morgan = require('morgan');
const dataStore = require('nedb-promises');
let twig = require('twig');
const path = require('path')
let multer = require('multer');
let jimp = require("jimp");
const crypto = require('crypto');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
 let app = express();
 let storageFichier = multer.diskStorage({
        destination: './views/public/fichiers',
        filename: (req,file,cb)=>{
        cb(null,Date.now()+'_'+file.originalname)
     }
 })
 app.use(expressValidator())
  app.use(session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true
  }))
    app.set('view engine','twig');
    // app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended : true}));
    app.use(express.static(`${__dirname}/views`));
    // app.use(morgan('dev'))

 const dbbatiplus = {}
 dbbatiplus.materiaux = new dataStore({filename: "dbbatiplus/materiaux.db",autoload:true})
 dbbatiplus.users = new dataStore({filename: "dbbatiplus/users.db",autoload:true})
 dbbatiplus.entreprises = new dataStore({filename: 'dbbatiplus/entreprises.db',autoload:true})
 dbbatiplus.achats = new dataStore({filename:'dbbatiplus/achats.db',autoload:true})
 dbbatiplus.commentaires = new dataStore({filename:'dbbatiplus/commentaires.db',autoload:true})
 dbbatiplus.batiment = new dataStore({filename:"dbbatiplus/batiment.db",autoload:true})
 dbbatiplus.commentairesb = new dataStore({filename:'dbbatiplus/commentairesb.db',autoload:true})
 dbbatiplus.users.ensureIndex({fieldName:"email",unique:true});
 dbbatiplus.achats.ensureIndex({fieldName:"nom_produit",unique:true})
 dbbatiplus.entreprises.ensureIndex({fieldName:"nom_ent",unique:true})
    const uploadFichier = multer({storage:storageFichier}).single('fichier');
const insertMateriaux = require('./insertmateriaux')(dbbatiplus);
//gerance page d'acceuil
    app.get('/',(req,res) => {
        if(req.session.cons)
        {
            res.render('pages/index',{user:req.session.cons,isConnect:true})
        }
        else
        {
           res.render('pages/index',{isConnect:false}); 
        }
    })
    // fin

    //gérance page de features
    app.get('/features',(req,res) => {
        if(req.session.cons)
        {
            res.render('pages/features',{user:req.session.cons,isConnect:true})
        }
        else
        {
           res.render('pages/features',{isConnect:false}); 
        }
    })
    // fin
    app.get('/deconnexion',(req,res)=>{
        delete req.session.cons
        res.redirect('/');
    })

    //gérance page de Quisommesnous
    app.get('/Quisommesnous',(req,res) => {
        if(req.session.cons)
        {
            res.render('pages/Quisommesnous',{user:req.session.cons,isConnect:true})
        }
        else
        {
           res.render('pages/Quisommesnous',{isConnect:false}); 
        }
    })
    //fin

    //gérance page plans et devis
    app.get('/plans&device',(req,res) => {
        if(req.session.cons)
        {
            res.render('pages/plans&device',{user:req.session.cons})
        }
        else
        {
            res.redirect('/')
        }
    });
    app.post('/plans&device',async (req,res)=>{
        if(req.body.typeForm == "addcomment")
        {
            console.log(req.body)
            let newcommentb = {
                type_bat:req.body.type_bat,
                nom_user:req.body.nom_user,
                commentaire:req.body.message
            }
            let Addcomment = await dbbatiplus.commentairesb.insert(newcommentb).then(doc=>{return doc}).catch((error)=>{return error})
            if(Addcomment)
            {
                let getComment = await dbbatiplus.commentairesb.find({type_bat:req.body.type_bat}).then((doc)=>{return doc}).catch((error)=>{return error})
                let getBat = await dbbatiplus.batiment.findOne({type : req.body.type_bat}).then((doc)=>{return doc}).catch((error)=>{return error})
                console.log(getBat)
                res.render('pages/resultRecherche',{user:req.session.cons,infos:getBat,setComment:true,comments:getComment})
            }
            else
            {
                console.log("erreur")
            }
        }
        else
        {
            let getComment = await dbbatiplus.commentairesb.find({type_bat:req.body.type_bat}).then((doc)=>{return doc}).catch((error)=>{return error})
            let getBat = await dbbatiplus.batiment.findOne({type: req.body.type_bat}).then((doc)=>{return doc}).catch((error)=>{return error})
            if(getBat != null)
            {
                res.render('pages/resultRecherche',{infos:getBat,user:req.session.cons,comments:getComment})
            }
            else
            {
                console.log("error")
            }   
        }
    })
    // fin

    //gerance page economiser sur vos depenses
    app.get('/achatmat',async (req,res) => {
        if(req.session.cons)
        {
            let recupMateriaux = await dbbatiplus.materiaux.find().then((doc)=>{return doc}).catch((error)=>{return error})
            res.render('pages/achatmat',{user:req.session.cons,articles:recupMateriaux})
        }
        else{
            res.redirect('/')
        }
    })
    app.post('/achatmat',async (req,res)=>{
        if(req.body.typeForm == "validationachat")
        {
            console.log(req.body)
            newAchat = {
                id_user: req.body.id_user,
                nom_produit: req.body.nom_produit,
                prix_unitaire : req.body.prix_unitaire,
                quantite : req.body.quantite,
                prix_total : req.body.prix_total,
                numero : req.body.numero,
                date_achat : new Date()
            }
            let insertAchat = await dbbatiplus.achats.insert(newAchat).then((doc)=>{console.log(doc);return true}).catch(()=>{return false})
            if(insertAchat)
            {
                let getArticle = await dbbatiplus.materiaux.findOne({_id:req.body.id_article}).then((doc)=>{return doc}).catch((error)=>{return error})
                res.render('pages/validercommande',{infos:getArticle,user:req.session.cons,validachat:true})
            }
            else
            {
                let getArticle = await dbbatiplus.materiaux.findOne({_id:req.body.id_article}).then((doc)=>{return doc}).catch((error)=>{return error})
                res.render('pages/validercommande',{infos:getArticle,user:req.session.cons,novalidachat:true}) 
            }
        }
        else
        {
            console.log(req.body)
            let getArticle = await dbbatiplus.materiaux.findOne({_id:req.body.id_article}).then((doc)=>{return doc}).catch((error)=>{return error})
            if(getArticle != null)
            {
                res.render('pages/validercommande',{infos:getArticle,user:req.session.cons})
            }
            else
            {
                console.log("erreur")
            }
        }    
    })
    // fin

    //gerance pages achats users
    app.get('/achat_user',async (req,res)=>{
        if(req.session.cons)
        {
            let Achats = await dbbatiplus.achats.find({id_user:req.session.cons._id}).then(doc=>{return doc}).catch(error=>{return error})
            console.log(Achats)
            if(Achats != null)
            {
                res.render('pages/users/achats',{achats:Achats,user:req.session.cons})
            }
            else
            {
                console.log("error")
            }
        }
        else
        {
            res.redirect('/')
        }
    })


    //gerance page de recrutement
    app.get('/recrutement', async (req,res) => {
        if(req.session.cons)
        {
            let recupEntreprise = await dbbatiplus.entreprises.find().then((doc)=>{return doc}).catch((error)=>{return error})
            res.render('pages/recrutement',{user:req.session.cons,entreprises:recupEntreprise})
        }
        else
        {
            res.redirect('/')
        }
    })
    app.post('/recrutement',async(req,res)=>{
        if(req.body.typeForm == "addcomment")
        {
            let newcomment = {
                id_ent:req.body.id_entreprise,
                nom_user:req.body.nom_user,
                commentaire:req.body.message
            }
            let Addcomment = await dbbatiplus.commentaires.insert(newcomment).then(doc=>{return doc}).catch((error)=>{return error})
            if(Addcomment)
            {
                let getComment = await dbbatiplus.commentaires.find({id_ent:req.body.id_entreprise}).then((doc)=>{return doc}).catch((error)=>{return error})
                let getEnt = await dbbatiplus.entreprises.findOne({_id:req.body.id_entreprise}).then((doc)=>{return doc}).catch((error)=>{return error})
                res.render('pages/voirplusEntreprises',{user:req.session.cons,infos:getEnt,setComment:true,comments:getComment})
            }
            else
            {
                console.log("erreur")
            }
        }
        else
        {
            console.log(req.body)
            let getComment = await dbbatiplus.commentaires.find({id_ent:req.body.id_ent}).then((doc)=>{return doc}).catch((error)=>{return error})
            let getEnt = await dbbatiplus.entreprises.findOne({_id:req.body.id_ent}).then((doc)=>{return doc}).catch((error)=>{return error})
            if(getEnt != null)
            {
                res.render('pages/voirplusEntreprises',{infos:getEnt,user:req.session.cons,comments:getComment})
            }
            else
            {
                console.log("erreur")
            }
        }    
    })
    // fin

    // gérance page de recherche
    app.get('/resultatRecherche',async(req,res)=>{
        if(req.session.cons)
        {
            res.render("resultatRecherche",{user:req.session.cons})
        }
        else
        {

        }

    })
    // fin

     // gérance connexion
     app.get('/connexion',(req,res)=>{
         res.render('pages/connexion')
     })
     app.post('/connexion', async (req,res)=>{
            console.log(req.body)
            let isUser = await dbbatiplus.users.findOne({email:req.body.email,password:req.body.password}).then((doc)=>{console.log(doc);return doc}).catch((error)=>{console.log(error);return error})
            if(isUser != null)
            {
                req.session.cons = isUser;
                res.redirect('/')
            }
            else
            {
                let isNotUser = true;
                res.render('pages/connexion',{isNotUser:isNotUser})
            }
     });
     //fin 

      // gérance connexion
      app.get('/inscription',(req,res)=>{
        res.render('pages/inscription')
    })
    app.post('/inscription',async (req,res)=>{
        console.log(req.body)
        let newUsers = {
            nom: req.body.nom,
            prenoms: req.body.prenoms,
            email: req.body.email,
            contacts : req.body.contacts,
            fonction : req.body.job,
            sexe: req.body.sexe,
            password: req.body.secondpassword
        }
        let inscriptUsers = await dbbatiplus.users.insert(newUsers).then(()=>{return true}).catch(()=>{return false})
        if(inscriptUsers)
        {
            isInscript = true;
            res.render('pages/inscription',{isInscript:isInscript})
        }
        else
        {
            isExist = true
            res.render('pages/inscription',{isExist:isExist})
        }
    })
    //fin 

    //gérance page de voirplus entreprises
    app.post('/voirplus',async (req,res) => {
    })
    // fin

    //géranc page de validachat
    app.post('/validerachat', async (req,res)=>{

    })
    //fin
 
    app.get('/error',(req,res)=>{
        res.render(`${__dirname}/views/pages/error.twig`)
    })
    app.use('*',(req,res)=>{
        res.redirect('/error');
    });
    app.listen(8090,()=>{console.log("j'écoute sur le port 8090")});
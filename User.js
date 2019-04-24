
let db;


module.exports = (_db)=>{
    db = _db;
    return User
}



let User = class  {

    static connexion(email, password){
        return new Promise((next)=>{
            db.query("SELECT * FROM users WHERE email = ? AND mot_de_passe = ?", [email, password])
                .then((result)=>{
                    if(result[0] !== undefined){
                        next(result[0])
                    }
                    else{
                        next(new Error('Aucun User'))
                    }
                })
                .catch((error)=>{
                    next(error);
                })
        })
    }
    static inscription(element){
        return new Promise((next) => {
            db.query("INSERT INTO users (nom,prenoms,email,contacts,localite,sexe,mot_de_passe) VALUES(?,?,?,?,?,?,?)",[element.nom,element.prenoms,element.email,element.contacts,element.localite,element.sexe,element.passwordc])
            .then((result) => {
                if(result[0] !== undefined){
                    next(result[0])
                }
                else{
                    next(new Error('Erreur survenu lors de l\'inscription'))
                }
            })
            .catch((error)=>{
                next(error);
            })
        })
    }
    
    static getPractizePublications(){
        return new Promise((next) =>{
            db.query('SELECT publications_good_practize.id as id_pub,publications_good_practize.objet,publications_good_practize.message,publications_good_practize.date_de_publication,publications_good_practize.id_user,users.nom,users.prenoms,users.email ,users.localite  FROM publications_good_practize INNER JOIN users ON publications_good_practize.id_user = users.id ORDER BY publications_good_practize.id DESC')
            .then((result) =>{
                next(result)
            })
            .catch((error)=>{
                next(error)
            })
        })
    }
    
    static getConseilSport(){
        return new Promise((next) =>{
            db.query('SELECT * FROM conseils_sports')
            .then((result) =>{
                next(result)
            })
            .catch((error)=>{
                next(error)
            })
        })
    }
    
     static getPlats(){
        return new Promise((next) =>{
            db.query('SELECT * FROM bons_plats')
            .then((result) =>{
                next(result)
            })
            .catch((error)=>{
                next(error)
            })
        })
    }
    
    static setPractizePublications(element,fichier){
        return new Promise((next)=>{
            db.query('INSERT INTO publications_good_practize (objet,message,fichier,id_user) VALUES(?,?,?,?)',[element.objet,element.message,fichier,element.id_user])
            .then((result)=>{
                if(result)
                {
                    next(result)
                }
                else
                {
                    next(new Error('erruer survenenue lors du serveur'));
                }
                  
            })
            .catch((error) =>{
                next(error)
            })
            
        })
    }
    
    static getCommentairesPractize(){
        return new Promise((next)=>{
            db.query('SELECT * FROM commmentaires_good_practize')
            .then((result)=>{
                if(result){
                    next(result)
                }
                else
                {
                    next(new Error('erreur survenue'));        
                }
            })
            .catch((error)=>{
                next(error)
            })
        })
    }
    
    static getCommentairesConseils(){
        return new Promise((next)=>{
            db.query('SELECT * FROM commentaires_advice')
            .then((result)=>{
                if(result){
                    next(result)
                }
                else
                {
                    next(new Error('erreur survenue'));        
                }
            })
            .catch((error)=>{
                next(error)
            })
        })
    }
    
    static getCommentairesPlats(){
        return new Promise((next)=>{
            db.query('SELECT * FROM commentaires_plats')
            .then((result)=>{
                if(result){
                    next(result)
                }
                else
                {
                    next(new Error('erreur survenue'));        
                }
            })
            .catch((error)=>{
                next(error)
            })
        })
    }
    
    
    static setCommentairesPractize(element){
        return new Promise((next)=>{
            db.query('INSERT INTO commmentaires_good_practize (name,commentaire,id_publication) VALUES (?,?,?)',[element.name,element.commentaire,element.id_publication])
            .then((result)=>{
                if(result){
                    next(result)
                }
                else
                {
                    next(new Error('erreur survenue'))
                }
            })
            .catch((error)=>{
                next(error)
            })
        })
    }
    
    static setCommentairesConseils(element){
        return new Promise((next)=>{
            db.query('INSERT INTO commentaires_advice (name,commentaire,id_advice) VALUES (?,?,?)',[element.name,element.commentaire,element.id_publication])
            .then((result)=>{
                if(result){
                    next(result)
                }
                else
                {
                    next(new Error('erreur survenue'))
                }
            })
            .catch((error)=>{
                next(error)
            })
        })
    }
    
    static getRecettesPlats(element){
        return new Promise((next)=>{
            db.query('SELECT bons_plats.id as id_p,bons_plats.nom,bons_plats.image,bons_plats.description,recettes_plats.description as recette_dep,recettes_plats.id_plats FROM bons_plats INNER JOIN recettes_plats ON bons_plats.id = recettes_plats.id_plats WHERE recettes_plats.id_plats = ?',[element])
            .then((result)=>{
                if(result[0] !== undefined){
                    next(result[0])
                }
                else
                {
                    next(new Error('erreur survenue'))
                }
            })
            .catch((error)=>{
                next(error)
            })
        })
    }
    
    
    static setCommentairesPlats(element){
        return new Promise((next)=>{
            db.query('INSERT INTO commentaires_plats (name,description,id_plats) VALUES (?,?,?)',[element.name,element.description,element.id_plat])
            .then((result)=>{
                if(result){
                    next(result)
                }
                else
                {
                    next(new Error('erreur survenue'))
                }
            })
            .catch((error)=>{
                next(error)
            })
        })
    }
    
    
    static deletePractizePublications(element){
        return new Promise((next)=>{
            db.query('DELETE FROM commmentaires_good_practize WHERE id_publication = ?',[element.id])
            .then((resultat)=>{
                if(resultat)
                {
                    db.query('DELETE FROM publications_good_practize WHERE id = ? AND id_user = ?',[element.id,element.id_user])
                    .then((result)=>{
                        if(result)
                        {
                            next(result);        
                        }
                        else
                        {
                            next(new Error('erreur lors de la suppression'));    
                        }
                    })
                    .catch((error)=>{
                        next(error)
                    })
                }
                else
                {
                    next(new Error('il ya une erreur'))        
                }
            })
            .catch((error)=>{
                next(error)
            })
           
        })
    }
    
}
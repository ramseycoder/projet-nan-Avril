let dbbatiplus = {}
module.exports = (_dbbatiplus)=>{
    dbbatiplus = _dbbatiplus;
    return func;
}
const func = class {
    static insert(type,description,cout_construction,cout_maindeouvre)
    {
        dbbatiplus.batiment.insert({type:type,description:description,cout_construction:cout_construction,cout_maindeouvre:cout_maindeouvre})
    }
}
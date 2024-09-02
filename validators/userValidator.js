const validate = (schema)=>(req,res,next)=>{
    try{
        const { error } = schema.validate(req.body);
        if(error){
            return res.status(400).json({status:false,error:error})
        }
        next()
    }catch(error){
        return res.status(500).json({status:false,error:error})
    }
}

module.exports = {
    validate
}
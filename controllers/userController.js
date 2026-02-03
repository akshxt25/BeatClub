import User from "../models/User.js";

export const signup = async (req , res) => {
    const { name, password } = req.body;
    console.log()
    if(!name || !password){
        return res.status(401).json({
            success: false,
            message: "Name or Password not found"
        })
    }
    try {
        const user = await User.findOne({
            name: name,
        })
        
        if(user){
            return res.status(401).json({
                message: "user already exists"
            })
        }
       
        const createdNewUser = await User.create({
            name: name,
            password: password
        })

        return res.status(200).json({
            message: "created successfully",
            data: createdNewUser
        })
        
    } catch (error) {
        console.error(error);
    }
}
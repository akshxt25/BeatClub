import User from "../models/User";

export const verifyJWT = async(req, res) => {
	try{
		const token = req.cookies?.accessToken || req.header("Authiorization")?.replace("Bearer ", "");
		
		if(!token){
			return res.status(401).json({
				success : false,
				message: "Invalid Access Token"
			});
		};
		
		const decodedToken = jwt.verify(token , process.env.AccessToken)
		
		const user = await User.findById(decodedToken?.Id).select("-password -refreshToken");  //decodedToken se users ki sari details mil jaengi and from select it will remove those things while returning things from DB Call.
		
		if(!user){
			return res.status(401).json({
				success: false,
				message: "Invalid Access Token"
			});
		};
		
		req.user = user;
		next();
	}
	catch{
		throw new Error("Invalid Access Token");
	}
}
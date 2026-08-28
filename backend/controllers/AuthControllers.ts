import {Request, Response} from 'express'
import User from '../models/user.js';
import bcrypt from 'bcrypt';

const validateStrongPassword = (password: string) => {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
};

// Controllers for User Registration
export const registerUser = async (req: Request, res: Response)=>{
    try{
        const {name, email, password} = req.body;

        // Find user by email
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: 'User already exists'})
        }

        const passwordErrors = validateStrongPassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({ message: passwordErrors.join(". ") });
        }

        //Encrypt the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({name, email, password: hashedPassword})
        await newUser.save()

        //setting user data in session
        req.session.isLoggedIn = true;
        req.session.userId = newUser._id;

        return res.json({
            message:'Account created successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        })
    } catch(error: any){
        console.log(error);
        res.status(500).json({message: error.message})
    }
}

//Controllers for User Login
export const loginUser = async (req: Request, res: Response)=>{
    try{
        const { email, password} = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        // Find user by email
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "No account found with this email. Please create an account first"})
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({message: 'Invalid email or password'})
        }

        //setting user data in session
        req.session.isLoggedIn = true;
        req.session.userId = user._id;

        return res.json({
            message:'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error: any){
        console.log(error);
        res.status(500).json({message: error.message})
    }
}

//Controllers for User Logout
export const logoutUser = async (req: Request, res: Response)=>{
    req.session.destroy((error: any)=>{
        if(error){
            console.log(error)
            return res.status(500).json({message: error.message})
        }
    })
    return res.json({message: 'Logout Successful'})
}

//Controllers for User Verify
export const verifyUser = async (req: Request, res: Response)=>{
    try{
        const {userId} = req.session;

        const user = await User.findById(userId).select('-password')

        if(!user){
           return res.status(400).json({message: 'Invalid user'}); 
        }

        return res.json({user});
        
    } catch (error: any){
        console.log(error);
        res.status(500).json({message: error.message})
    }
}

// Controllers for Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No account found with this email" });
    }

    // Generate a simple token (for demo purpose)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // For resume/demo purpose we return the token
    return res.json({
      message: "Reset token generated successfully",
      resetToken: resetToken,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Controllers for Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Validate strong password
    const passwordErrors = validateStrongPassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: passwordErrors.join(". ") });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password reset successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
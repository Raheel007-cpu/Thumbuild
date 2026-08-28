import mongoose from "mongoose";

export interface IUser extends Document{
    name: string;
    email: string;
    password?: string;
    resetPasswordToken?: string | null;
    resetPasswordExpires?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
    name: {type: String, required: true, trim:true},
    email: {type: String, required: true, trim:true, unique:true, lowercase:true},
    password: {type: String, required: true},
    resetPasswordToken: {type: String, default: null},
    resetPasswordExpires: {type: Date, default: null},
    
}, {timestamps:true})

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User;
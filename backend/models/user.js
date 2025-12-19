import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";
import bcrypt from "bcrypt";
import passwordComplexity from "joi-password-complexity";

const userSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	DOB: { type: Date, required: true },
	isVerified: { type: Boolean, default: false },
	verificationCode: String,
	verificationCodeExpires: Date,
	verifiedAt: Date,
	lastVerificationRequest: Date,
	passwordResetToken: String,
    passwordResetExpires: Date,
    passwordResetAttempts: { type: Number, default: 0 },
    lastPasswordResetRequest: Date,
},{timestamps: true}
);

// // 🔐 Hash password before save
// userSchema.pre("save", async function (next) {
// 	if (!this.isModified("password")) return next();

// 	const salt = await bcrypt.genSalt(10);
// 	this.password = await bcrypt.hash(this.password, salt);
// 	next();
// });

// 🔑 Generate JWT
userSchema.methods.generateAuthToken = function () {
	return jwt.sign(
		{ _id: this._id },
		process.env.JWTPRIVATEKEY,
		{ expiresIn: "7d" }
	);
};

// 🔍 Compare password (login)
userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const Usermodel = mongoose.model("user", userSchema);

// ✅ Joi validation
const validate = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().required().label("First Name"),
		lastName: Joi.string().required().label("Last Name"),
		email: Joi.string().email().required().label("Email"),
		password: passwordComplexity().required().label("Password"),
		DOB: Joi.date().required().label("Date of Birth"),
	});
	return schema.validate(data);
};

export { Usermodel , validate }; 
import  validator  from 'validator';
const validate= (data)=>{
    // const {firstName,lastName,email,password,age}=data;
    // if(!firstName || !lastName || !email || !password){
    //     throw new Error('All fields are required');
    // }
    // if(!validator.isEmail(email)){
    //     throw new Error('Invalid email format');
    // }
    // if(password.length<6 && !validator.isStrongPassword(password)){
    //     throw new Error('Password must be at least 6 characters long');
    // }
    // if(age && (isNaN(age) || age<5)){
    //     throw new Error('Age must be a number greater than or equal to 5');
    // }
    return true;
};

export default validate;
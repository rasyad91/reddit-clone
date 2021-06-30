import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";

export const validateRegister = (options:UsernamePasswordInput) => {
    const {username, password, email } = options
    const errors = []

    username.length < 2 && errors.push({ field: "username", message: "length must be greater than 2" })
    username.includes("@") && errors.push({ field: "username", message: "username cannot include @" })
    password.length < 8 && errors.push({ field: "password", message: "length must be greater than 8" })
    !email.includes("@") && errors.push({ field: "email", message: "invalid email" })
    return errors
}

export const validateLogin = (usernameOrEmail: string, password: string) => {
    const errors = []

    usernameOrEmail === "" && errors.push({ field: "usernameOrEmail", message: "field required" })
    password === "" && errors.push({ field: "password", message: "password required" })

    return errors
}
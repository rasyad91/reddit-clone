import React from 'react';
import { Form, Formik } from 'formik';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Box, Button } from '@chakra-ui/react';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Login: React.FC<{}> = ({ }) => {
    const router = useRouter();
    const [, login] = useLoginMutation()
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    console.log("values", values)
                    const response =  await login(values);
                    if (response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors))
                    } else if (response.data?.login.user) {
                        // worked
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="usernameOrEmail"
                            label="Username Or Email"
                            placeholder="Username Or Email"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                label="Password"
                                placeholder="Password"
                                type="password"
                            />
                        </Box>
                        <Button
                            type="submit"
                            mt={4}
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
};

export default withUrqlClient(createUrqlClient)(Login) 
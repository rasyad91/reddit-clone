import { Box, Button, Flex } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({ }) => {
    const [, forgotPassword] = useForgotPasswordMutation()
    const [complete, setComplete] = useState(false)
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ email: "", }}
                onSubmit={async (email) => {
                    console.log("values", email)
                    const response = await forgotPassword(email);
                    if (response.data?.forgotPassword) setComplete(response.data?.forgotPassword)
                }}
            >

                {({ isSubmitting }) => 
                complete ? (
                <Box>
                    <b>If an account with that email exists, we sent you the link to reset to your email</b>
                </Box>
                ) : (
                    <Box>
                        <Flex mb={10}>
                            <h1><b>Forgot Password</b></h1>
                        </Flex>
                        <Form>
                            <InputField
                                name="email"
                                label="Email"
                                placeholder="Email"
                                type="email"
                            />
                            <Button
                                mt={3}
                                type="submit"
                                colorScheme="teal"
                                isLoading={isSubmitting}
                            >
                                Reset Password
                            </Button>
                        </Form>
                    </Box>
                )}
            </Formik>
        </Wrapper>
    )
};

export default withUrqlClient(createUrqlClient)(ForgotPassword)
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
    const router = useRouter()
    const [, changePassword] = useChangePasswordMutation()
    const [tokenError, setTokenError] = useState('');

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ newPassword: "", confirmPassword: "" }}
                onSubmit={async ({ newPassword, confirmPassword }, { setErrors }) => {
                    if (newPassword !== confirmPassword) {
                        setErrors({ confirmPassword: "Password not matched" })
                        return
                    }
                    const response = await changePassword({ newPassword, token })
                    if (response.data?.changePassword.errors) {
                        const errorMap = toErrorMap(response.data.changePassword.errors)
                        if ('token' in errorMap) setTokenError(errorMap.token)
                        setErrors(errorMap);
                    } else {
                        router.push("/")
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="newPassword"
                            label="New Password"
                            placeholder="New Password"
                            type="password"
                        />
                        <Box mt={4}>
                            <InputField
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="Confirm Password"
                                type="password"
                            />
                        </Box>
                        {tokenError ? (
                            <Flex>
                                <Box mr={3} color="red">{tokenError}</Box>
                                <NextLink href="/forgot-password">
                                    <Link> Renew token</Link>
                                </NextLink>
                            </Flex>
                        ) : null}
                        <Button
                            type="submit"
                            mt={4}
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Change Password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

// getInitialProps is a next js function, that gets any query that is passed to
// the main function, in this case ChangePassword
ChangePassword.getInitialProps = ({ query }) => {
    return {
        token: query.token as string
    }
}

export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword);